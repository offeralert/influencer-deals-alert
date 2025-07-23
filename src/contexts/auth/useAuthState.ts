
import React, { useState, useRef, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { ProfileType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Ensure React hooks are available
const { useState: useStateHook, useRef: useRefHook, useCallback: useCallbackHook } = React;

export const useAuthState = () => {
  const [session, setSession] = useStateHook<Session | null>(null);
  const [user, setUser] = useStateHook<User | null>(null);
  const [profile, setProfile] = useStateHook<ProfileType | null>(null);
  const [loading, setLoading] = useStateHook(true);
  
  // Track profile fetch attempts to prevent loops
  const profileFetchAttempted = useRefHook<string | null>(null);
  const profileFetchTimeout = useRefHook<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallbackHook(async (userId: string) => {
    if (!userId) {
      console.log("No userId provided to fetchProfile");
      return;
    }

    // Prevent repeated fetching for the same user
    if (profileFetchAttempted.current === userId) {
      console.log("Profile fetch already attempted for user:", userId);
      return;
    }

    profileFetchAttempted.current = userId;

    // Clear any existing timeout
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current);
    }

    // Set a timeout to ensure we don't fetch forever
    profileFetchTimeout.current = setTimeout(() => {
      console.log("Profile fetch timeout for user:", userId);
      setProfile(null);
    }, 10000); // 10 second timeout

    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Clear timeout on successful response
      if (profileFetchTimeout.current) {
        clearTimeout(profileFetchTimeout.current);
        profileFetchTimeout.current = null;
      }

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          console.log('No profile found for user - this is normal for new users');
          setProfile(null);
        } else {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        console.log("Fetched profile:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
      
      // Clear timeout on error
      if (profileFetchTimeout.current) {
        clearTimeout(profileFetchTimeout.current);
        profileFetchTimeout.current = null;
      }
    }
  }, []); // Stable function with no dependencies

  const refreshProfile = useCallbackHook(async () => {
    if (user) {
      console.log("🔄 Refreshing profile for user:", user.id);
      // Reset the fetch attempt flag to allow refresh
      profileFetchAttempted.current = null;
      await fetchProfile(user.id);
      console.log("✅ Profile refresh completed");
    }
  }, [user?.id, fetchProfile]);

  const signOut = useCallbackHook(async () => {
    try {
      console.log("Signing out user");
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      // Reset profile fetch tracking
      profileFetchAttempted.current = null;
      
      // Clear any pending timeout
      if (profileFetchTimeout.current) {
        clearTimeout(profileFetchTimeout.current);
        profileFetchTimeout.current = null;
      }
      
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
  }, []);

  return {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    fetchProfile,
    refreshProfile,
    signOut
  };
};
