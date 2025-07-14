
import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { ProfileType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this is expected for new users
          console.log('No profile found for user');
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
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log("🔄 Refreshing profile for user:", user.id);
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
      setLoading(false);
      
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
    fetchProfile,
    refreshProfile,
    signOut
  };
};
