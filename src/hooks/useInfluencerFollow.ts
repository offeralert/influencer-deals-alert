
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
      // Check if there are any entries in user_domain_map for this user-influencer pair
      const { data, error } = await supabase
        .from('user_domain_map')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .limit(1);
      
      if (!error && data && data.length > 0) {
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
      // Show toast notification with sign-up prompt for non-logged-in users
      toast.error("Please create an account or sign in to follow influencers.", {
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
        // Unfollow: Delete all domain mappings for this user-influencer pair
        const { error } = await supabase
          .from('user_domain_map')
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
        // Follow: First get all the influencer's active offers
        const { data: promoCodes, error: promoError } = await supabase
          .from('promo_codes')
          .select('affiliate_link')
          .eq('user_id', influencerId)
          .not('affiliate_link', 'is', null);
        
        if (promoError) {
          console.error("Error fetching promo codes:", promoError);
          toast.error("Failed to follow. Please try again.");
          return;
        }
        
        // Extract domains from affiliate links and create unique entries
        const domains = new Set();
        promoCodes?.forEach(promo => {
          if (promo.affiliate_link) {
            try {
              const url = new URL(promo.affiliate_link);
              domains.add(url.hostname);
            } catch (e) {
              console.error("Error parsing URL:", e);
            }
          }
        });
        
        if (domains.size > 0) {
          // Insert one row per domain
          const domainEntries = Array.from(domains).map(domain => ({
            user_id: user.id,
            influencer_id: influencerId,
            domain: domain
          }));
          
          const { error: insertError } = await supabase
            .from('user_domain_map')
            .insert(domainEntries);
          
          if (insertError) {
            console.error("Error following influencer:", insertError);
            toast.error("Failed to follow. Please try again.");
            return;
          }
        } else {
          // If no domains found, still create a relationship with null domain
          const { error: insertError } = await supabase
            .from('user_domain_map')
            .insert({
              user_id: user.id,
              influencer_id: influencerId,
              domain: null
            });
          
          if (insertError) {
            console.error("Error following influencer:", insertError);
            toast.error("Failed to follow. Please try again.");
            return;
          }
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
