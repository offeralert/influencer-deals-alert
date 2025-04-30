
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { extractDomain } from "@/utils/supabaseQueries";

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
        
        // Success indicator to track if at least one domain was added
        let followSuccess = false;
        
        // Extract domains from affiliate links and create unique entries
        const validDomains = new Set<string>();
        
        // Safely parse all URLs and collect valid domains
        if (promoCodes) {
          promoCodes.forEach(promo => {
            if (promo.affiliate_link) {
              const domain = extractDomain(promo.affiliate_link);
              if (domain) {
                validDomains.add(domain);
              }
            }
          });
        }
        
        if (validDomains.size > 0) {
          // Build entries for insertion
          const domainEntries = Array.from(validDomains).map(domain => ({
            user_id: user.id,
            influencer_id: influencerId,
            domain
          }));
          
          // Add one domain at a time, ignoring duplicates
          for (const entry of domainEntries) {
            try {
              await supabase
                .from('user_domain_map')
                .insert(entry);
              
              followSuccess = true;
            } catch (err) {
              // Ignore duplicate key errors but log them
              console.log("Could not add domain (likely already exists):", entry.domain);
            }
          }
        } 
        
        // If no domains were added successfully, create a mapping with null domain as fallback
        if (!followSuccess) {
          try {
            const { error: insertError } = await supabase
              .from('user_domain_map')
              .insert({
                user_id: user.id,
                influencer_id: influencerId,
                domain: null
              });
            
            if (!insertError) {
              followSuccess = true;
            }
          } catch (err) {
            console.error("Error adding null domain mapping:", err);
          }
        }
        
        if (followSuccess) {
          setIsFollowing(true);
          toast.success(`You're now following ${influencerName}`);
        } else {
          toast.error("Failed to follow. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return { isFollowing, handleFollowToggle };
};
