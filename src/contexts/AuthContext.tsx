import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maximum loading time before showing error (10 seconds)
const MAX_LOADING_TIME = 10000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading timeout to prevent infinite loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.error("AuthContext: Loading timeout reached, setting error state");
        setError("Authentication loading timeout. Please refresh the page.");
        setLoading(false);
        setProfileLoading(false);
      }
    }, MAX_LOADING_TIME);

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setError(null); // Clear any previous errors
        
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
    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Getting existing session");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setError("Failed to initialize authentication");
          setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log("Got existing session:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setProfileLoading(true);
          await fetchProfile(currentSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!userId) {
      console.error("fetchProfile called without userId");
      setProfileLoading(false);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching profile for user:", userId);
      
      // Add timeout for profile fetching
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this is expected for new users
          console.log('No profile found for user, creating empty profile');
          setProfile(null);
        } else {
          console.error('Error fetching profile:', error);
          setError("Failed to load user profile");
          setProfile(null);
        }
      } else {
        console.log("Fetched profile:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setError("Failed to load user profile");
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
      setError(null);
      await fetchProfile(user.id);
      console.log("✅ Profile refresh completed");
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        toast.error("Error signing out: " + error.message);
        return;
      }
      
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error('Error in signOut function:', error);
      toast.error("Error signing out");
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
      setJustSignedUp,
      error
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
