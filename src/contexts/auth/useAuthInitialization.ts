
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UseAuthInitializationProps = {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
};

export const useAuthInitialization = ({
  setSession,
  setUser,
  setLoading,
  fetchProfile
}: UseAuthInitializationProps) => {
  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let mounted = true;
    
    // Single source of truth: only use auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile for authenticated user
          await fetchProfile(currentSession.user.id);
        } else {
          // No user, we're done loading
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setLoading, fetchProfile]);
};
