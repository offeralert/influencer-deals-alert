
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile immediately without delay
          fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
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
        setLoading(false);
        return;
      }

      console.log("Fetched profile:", data);
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading,
      isLoading: loading,
      signOut, 
      refreshProfile,
      isInfluencer,
      isAgency,
      isAuthenticated
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
