
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useInfluencerFollow = (influencerId: string | undefined, influencerName: string) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user && influencerId) {
      checkFollowingStatus();
    }
  }, [influencerId, user]);

  const checkFollowingStatus = async () => {
    if (!user || !influencerId) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .maybeSingle();
      
      if (!error && data) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Sign in required", {
        description: "Create an account to follow influencers and save their deals",
        action: {
          label: "Sign Up",
          onClick: () => navigate("/signup")
        }
      });
      return;
    }
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('influencer_id', influencerId);
        
        if (error) {
          console.error("Error unfollowing influencer:", error);
          toast.error("Failed to unfollow. Please try again.");
          return;
        }
        
        setIsFollowing(false);
        toast.success(`You are no longer following ${influencerName}`);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            influencer_id: influencerId
          });
        
        if (error) {
          console.error("Error following influencer:", error);
          toast.error("Failed to follow. Please try again.");
          return;
        }
        
        setIsFollowing(true);
        toast.success(`You're now following ${influencerName}`);
      }
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
    }
  };

  return { isFollowing, handleFollowToggle };
};
