
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
    
    // Get current session first
    const getCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log("Found existing session:", session.user?.email);
          setSession(session);
          setUser(session.user);
          // Fetch profile asynchronously without blocking auth
          fetchProfile(session.user.id).catch(console.error);
        } else {
          console.log("No existing session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in getCurrentSession:", error);
        setLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted.current) return;
        
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        // Update session and user state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile asynchronously without blocking auth completion
          fetchProfile(currentSession.user.id).catch((error) => {
            console.error("Profile fetch failed:", error);
            // Don't block auth flow if profile fetch fails
          });
        }
        
        // Always clear loading state after auth state change
        setLoading(false);
      }
    );

    // Initialize with current session
    getCurrentSession();

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []); // Stable dependencies only
};
