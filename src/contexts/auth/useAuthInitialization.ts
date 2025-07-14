
import { useEffect, useRef } from "react";
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
  const mounted = useRef(true);
  const initialized = useRef(false);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    mounted.current = true;
    
    // Prevent multiple initializations
    if (initialized.current) {
      console.log("Auth already initialized, skipping");
      return;
    }
    
    initialized.current = true;
    
    // Single source of truth: only use auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted.current) return;
        
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile for authenticated user
          setTimeout(() => {
            if (mounted.current) {
              fetchProfile(currentSession.user.id);
            }
          }, 0);
        } else {
          // No user, we're done loading
          if (mounted.current) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setLoading, fetchProfile]);
};
