
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { extractDomain, addDomainMappings } from "@/utils/supabaseQueries";

export const useInfluencerFollow = (influencerId: string | undefined, influencerName: string) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && influencerId) {
      checkFollowingStatus();
    } else {
      setIsFollowing(false);
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
    
    if (isProcessing || !influencerId) {
      return; // Prevent duplicate requests or invalid influencer ID
    }
    
    setIsProcessing(true);
    
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
          setIsProcessing(false);
          return;
        }
        
        setIsFollowing(false);
        toast.success(`You are no longer following ${influencerName}`);
      } else {
        // Follow: Get ALL the influencer's offers from universal_promo_codes view
        // Note: Not using .limit() here to make sure we get all offers
        const { data: promoCodes, error: promoError } = await supabase
          .from('universal_promo_codes')
          .select('affiliate_link')
          .eq('influencer_id', influencerId);
        
        if (promoError) {
          console.error("Error fetching promo codes:", promoError);
          toast.error("Failed to follow. Please try again.");
          setIsProcessing(false);
          return;
        }
        
        // Extract all affiliate links, ensuring we don't filter out any
        const affiliateLinks = promoCodes
          ?.map(promo => promo.affiliate_link)
          .filter(link => link) as string[] || [];
        
        console.log(`Found ${affiliateLinks.length} affiliate links for influencer ${influencerId} in universal_promo_codes`);
        
        // Add at least one domain mapping, even if no affiliate links are found
        // This ensures the user can follow even if the influencer has no offers yet
        if (affiliateLinks.length === 0) {
          affiliateLinks.push(""); // Add empty string to ensure we create at least one mapping
        }
        
        // Add domain mappings using our improved helper function
        // This will handle multiple domain mappings for the same influencer
        const result = await addDomainMappings(user.id, influencerId, affiliateLinks);
        
        if (result.success) {
          setIsFollowing(true);
          toast.success(`You're now following ${influencerName}`, {
            description: `Added ${result.domainsAdded} domain${result.domainsAdded !== 1 ? 's' : ''} to your follow list`
          });
        } else {
          toast.error("Failed to follow. Please try again.", {
            description: "Could not create domain mappings"
          });
        }
      }
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { isFollowing, handleFollowToggle, isProcessing };
};
