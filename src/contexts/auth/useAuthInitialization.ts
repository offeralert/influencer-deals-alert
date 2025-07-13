import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UseAuthInitializationProps = {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setError: (error: string | null) => void;
  setProfileLoading: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
};

export const useAuthInitialization = ({
  setSession,
  setUser,
  setError,
  setProfileLoading,
  setLoading,
  fetchProfile
}: UseAuthInitializationProps) => {
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
          setSession(null);
          setUser(null);
          setProfileLoading(false);
          setLoading(false);
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
  }, [setSession, setUser, setError, setProfileLoading, setLoading, fetchProfile]);
};
