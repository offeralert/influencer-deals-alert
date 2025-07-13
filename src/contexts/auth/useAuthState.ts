
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { ProfileType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_LOADING_TIME } from "./constants";

export const useAuthState = () => {
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

  return {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    profileLoading,
    setProfileLoading,
    justSignedUp,
    setJustSignedUp,
    error,
    setError,
    fetchProfile,
    refreshProfile,
    signOut
  };
};
