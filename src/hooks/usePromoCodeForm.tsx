
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { extractDomain } from "@/utils/supabaseQueries";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { SUBSCRIPTION_TIERS } from "@/constants/promoCodeConstants";

interface PromoCodeFormData {
  brandName: string;
  brandUrl: string;
  promoCode: string;
  expirationDate: string;
  affiliateLink: string;
  description: string;
  category: string;
}

interface UsePromoCodeFormProps {
  onPromoCodeAdded: () => void;
}

export const usePromoCodeForm = ({ onPromoCodeAdded }: UsePromoCodeFormProps) => {
  const { user } = useAuth();
  const { subscriptionTier, maxOffers, bypassOfferLimits } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    brandName: "",
    brandUrl: "",
    promoCode: "",
    expirationDate: "",
    affiliateLink: "",
    description: "",
    category: "Fashion", // Default category
  });
  const [currentOfferCount, setCurrentOfferCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // Get the next tier for upgrade suggestions
  const getNextTier = () => {
    const currentTierIndex = SUBSCRIPTION_TIERS.findIndex(tier => tier.name === subscriptionTier);
    if (currentTierIndex < SUBSCRIPTION_TIERS.length - 1) {
      return SUBSCRIPTION_TIERS[currentTierIndex + 1];
    }
    return null;
  };
  
  const nextTier = getNextTier();

  // Fetch current offer count
  useEffect(() => {
    const fetchOfferCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('promo_codes')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', user.id);
        
        if (error) throw error;
        setCurrentOfferCount(count || 0);
      } catch (err) {
        console.error("Error fetching offer count:", err);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchOfferCount();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateFollowerDomains = async (influencerId: string, brandUrl: string | null, affiliateLink: string | null) => {
    if (!influencerId) return;
    
    try {
      // Extract domains from both URLs
      const domains: string[] = [];
      
      if (brandUrl) {
        const brandDomain = extractDomain(brandUrl);
        if (brandDomain) domains.push(brandDomain);
      }
      
      if (affiliateLink) {
        const affiliateDomain = extractDomain(affiliateLink);
        if (affiliateDomain && !domains.includes(affiliateDomain)) domains.push(affiliateDomain);
      }
      
      if (domains.length === 0) return;
      
      // Get all followers of this influencer
      const { data: followers, error: followerError } = await supabase
        .from('user_domain_map')
        .select('user_id')
        .eq('influencer_id', influencerId)
        .limit(1000);
        
      if (followerError || !followers || followers.length === 0) return;
      
      // Add new domains for each follower
      for (const domain of domains) {
        const domainEntries = followers.map(follower => ({
          user_id: follower.user_id,
          influencer_id: influencerId,
          domain: domain
        }));
        
        await supabase
          .from('user_domain_map')
          .upsert(domainEntries, { 
            onConflict: 'user_id,influencer_id,domain',
            ignoreDuplicates: true 
          });
      }
    } catch (error) {
      console.error("Error updating follower domains:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add promo codes");
      return;
    }

    if (!formData.brandName.trim() || !formData.brandUrl.trim() || !formData.promoCode.trim() || !formData.description.trim() || !formData.affiliateLink.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if user has reached their subscription offer limit
    // BUT bypass the check if BYPASS_OFFER_LIMITS is true
    if (!bypassOfferLimits && currentOfferCount >= maxOffers) {
      // Find the next subscription tier that would accommodate more offers
      let requiredTier = "Boost";
      
      if (currentOfferCount >= 20) {
        requiredTier = "Elite";
      } else if (currentOfferCount >= 10) {
        requiredTier = "Pro";
      } else if (currentOfferCount >= 3) {
        requiredTier = "Growth";
      }
      
      toast.error(`You've reached your limit of ${maxOffers} offers with the ${subscriptionTier} plan.`, {
        action: {
          label: `Upgrade to ${requiredTier}`,
          onClick: () => window.location.href = "/pricing"
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, data } = await supabase.from("promo_codes").insert({
        influencer_id: user.id,
        brand_name: formData.brandName,
        brand_url: formData.brandUrl,
        promo_code: formData.promoCode,
        description: formData.description,
        expiration_date: formData.expirationDate || null,
        affiliate_link: formData.affiliateLink,
        category: formData.category,
      }).select();

      if (error) {
        toast.error("Failed to add promo code");
        console.error("Error adding promo code:", error);
        return;
      }

      // Update domain mappings for all followers from both brand URL and affiliate link
      await updateFollowerDomains(user.id, formData.brandUrl, formData.affiliateLink);

      toast.success("Promo code added successfully!");
      
      // Reset form
      setFormData({
        brandName: "",
        brandUrl: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: "",
        category: "Fashion",
      });
      
      // Update the current offer count
      setCurrentOfferCount(prev => prev + 1);
      
      // Show upgrade suggestions if approaching the limit AND not bypassing limits
      if (!bypassOfferLimits && currentOfferCount + 1 >= maxOffers - 1 && nextTier) {
        toast("Running out of offer slots!", {
          description: `You have ${maxOffers - (currentOfferCount + 1)} slots left. Consider upgrading to ${nextTier.name} for ${nextTier.maxOffers} offers.`,
          action: {
            label: "Upgrade Plan",
            onClick: () => window.location.href = "/pricing"
          }
        });
      }
      
      // Notify parent component
      onPromoCodeAdded();
    } catch (error) {
      console.error("Unexpected error adding promo code:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    isLoadingCount,
    currentOfferCount,
    maxOffers,
    subscriptionTier,
    bypassOfferLimits,
    nextTier,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
