
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

type DeferredAuthContextType = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  loading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialized: boolean;
};

const DeferredAuthContext = createContext<DeferredAuthContextType | undefined>(undefined);

export function DeferredAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Defer auth initialization until after LCP
    const timer = setTimeout(() => {
      initializeAuth();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const initializeAuth = async () => {
    try {
      console.log("DeferredAuth: Initializing auth state (deferred)");
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Deferred auth state changed:", event, currentSession?.user?.email);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          } else {
            setProfile(null);
          }
        }
      );

      // Check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Got existing session (deferred):", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
      
      setLoading(false);
      setInitialized(true);

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error in deferred auth initialization:", error);
      setLoading(false);
      setInitialized(true);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user (deferred):", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log("Fetched profile (deferred):", data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user (deferred)");
      
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

  return (
    <DeferredAuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading,
      isLoading: loading,
      signOut, 
      refreshProfile,
      initialized
    }}>
      {children}
    </DeferredAuthContext.Provider>
  );
}

export function useDeferredAuth() {
  const context = useContext(DeferredAuthContext);
  if (context === undefined) {
    throw new Error("useDeferredAuth must be used within a DeferredAuthProvider");
  }
  return context;
}
