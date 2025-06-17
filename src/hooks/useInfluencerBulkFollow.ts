
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { addDomainMappings } from "@/utils/supabaseQueries";
import { Influencer } from "@/types/explore";

export const useInfluencerBulkFollow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkFollowingStatus = async (influencerIds: string[]) => {
    if (!user || influencerIds.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('user_domain_map')
        .select('influencer_id')
        .eq('user_id', user.id)
        .in('influencer_id', influencerIds);

      if (error) {
        console.error("Error checking follow status:", error);
        return [];
      }

      return data?.map(item => item.influencer_id) || [];
    } catch (error) {
      console.error("Error in checkFollowingStatus:", error);
      return [];
    }
  };

  const followAllInfluencers = async (influencers: Influencer[]) => {
    if (!user) {
      toast.error("Please create an account or sign in to follow influencers.", {
        description: "Create an account to follow influencers and save their deals",
        action: {
          label: "Sign Up",
          onClick: () => navigate("/signup")
        }
      });
      return { success: false, followedCount: 0 };
    }

    if (isProcessing || influencers.length === 0) {
      return { success: false, followedCount: 0 };
    }

    setIsProcessing(true);

    try {
      // Check which influencers are already being followed
      const influencerIds = influencers.map(inf => inf.id);
      const alreadyFollowed = await checkFollowingStatus(influencerIds);
      const unfollowedInfluencers = influencers.filter(inf => !alreadyFollowed.includes(inf.id));

      if (unfollowedInfluencers.length === 0) {
        toast.info("You're already following all visible influencers!");
        setIsProcessing(false);
        return { success: true, followedCount: 0 };
      }

      let successCount = 0;
      let totalPromosAdded = 0;

      // Process in batches of 5 to avoid overwhelming the database
      const batchSize = 5;
      for (let i = 0; i < unfollowedInfluencers.length; i += batchSize) {
        const batch = unfollowedInfluencers.slice(i, i + batchSize);
        
        for (const influencer of batch) {
          try {
            console.log(`Following influencer: ${influencer.full_name} (${influencer.id})`);

            // Get all the influencer's offers from promo_codes table
            const { data: promoCodes, error: promoError } = await supabase
              .from('promo_codes')
              .select('affiliate_link, expiration_date')
              .eq('influencer_id', influencer.id);

            if (promoError) {
              console.error(`Error fetching promo codes for ${influencer.full_name}:`, promoError);
              continue;
            }

            // Filter out expired promo codes
            const now = new Date();
            const validPromoCodes = promoCodes?.filter(promo => {
              if (promo.expiration_date) {
                const expiryDate = new Date(promo.expiration_date);
                return expiryDate >= now;
              }
              return true;
            });

            // Extract affiliate links
            const affiliateLinks = validPromoCodes
              ?.map(promo => promo.affiliate_link)
              .filter(link => link) as string[] || [];

            // Add at least one domain mapping, even if no affiliate links are found
            if (affiliateLinks.length === 0) {
              affiliateLinks.push(""); // Add empty string to ensure we create at least one mapping
            }

            // Add domain mappings
            const result = await addDomainMappings(user.id, influencer.id, affiliateLinks);

            if (result.success) {
              successCount++;
              totalPromosAdded += result.domainsAdded;
              console.log(`Successfully followed ${influencer.full_name} with ${result.domainsAdded} domains`);
            } else {
              console.error(`Failed to follow ${influencer.full_name}`);
            }
          } catch (error) {
            console.error(`Error following ${influencer.full_name}:`, error);
          }
        }

        // Small delay between batches to prevent rate limiting
        if (i + batchSize < unfollowedInfluencers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully followed ${successCount} influencer${successCount === 1 ? '' : 's'}!`, {
          description: `Added ${totalPromosAdded} ${totalPromosAdded === 1 ? 'offer' : 'offers'} to your browser extension`
        });
      }

      if (successCount < unfollowedInfluencers.length) {
        const failedCount = unfollowedInfluencers.length - successCount;
        toast.warning(`${failedCount} influencer${failedCount === 1 ? '' : 's'} could not be followed. Please try again.`);
      }

      setIsProcessing(false);
      return { success: successCount > 0, followedCount: successCount };

    } catch (error) {
      console.error("Error in followAllInfluencers:", error);
      toast.error("An error occurred while following influencers. Please try again.");
      setIsProcessing(false);
      return { success: false, followedCount: 0 };
    }
  };

  return {
    followAllInfluencers,
    isProcessing
  };
};
