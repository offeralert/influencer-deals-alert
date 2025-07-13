import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ProfileType = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_influencer?: boolean;
  is_featured?: boolean;
  is_agency?: boolean;
  is_creditcard?: boolean;
  category?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  loading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isInfluencer: boolean;
  isAgency: boolean;
  isAuthenticated: boolean;
  profileLoading: boolean;
  justSignedUp: boolean;
  setJustSignedUp: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Keep loading true until profile is fetched
          setProfileLoading(true);
          fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
          setJustSignedUp(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        setProfileLoading(true);
        fetchProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        console.log("Fetched profile:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log("🔄 Refreshing profile for user:", user.id);
      setProfileLoading(true);
      await fetchProfile(user.id);
      console.log("✅ Profile refresh completed");
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Logged out successfully",
      });
      
    } catch (error) {
      console.error('Error in signOut function:', error);
      toast({
        variant: "destructive", 
        title: "Error signing out",
      });
    }
  };

  const isInfluencer = profile?.is_influencer === true;
  const isAgency = profile?.is_agency === true;
  const isAuthenticated = !!user;
  
  // Overall loading includes both auth loading and profile loading for authenticated users
  const overallLoading = loading || (user && profileLoading);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading: overallLoading,
      isLoading: overallLoading,
      signOut, 
      refreshProfile,
      isInfluencer,
      isAgency,
      isAuthenticated,
      profileLoading,
      justSignedUp,
      setJustSignedUp
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
