
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { extractDomain } from "@/utils/supabaseQueries";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_TIERS } from "@/constants/promoCodeConstants";

interface PromoCodeFormData {
  brandName: string;
  brandUrl: string;
  brandInstagramHandle: string;
  promoCode: string;
  expirationDate: string;
  affiliateLink: string;
  description: string;
  category: string;
}

interface UsePromoCodeFormProps {
  onPromoCodeAdded: () => void;
}

const STORAGE_KEY = "promo_code_form_draft";

// Helper function to safely access localStorage
const getStoredFormData = (): Partial<PromoCodeFormData> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to parse stored form data:", error);
    return null;
  }
};

// Helper function to safely save to localStorage
const saveFormData = (data: PromoCodeFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save form data:", error);
  }
};

// Helper function to clear stored form data
const clearStoredFormData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear stored form data:", error);
  }
};

export const usePromoCodeForm = ({ onPromoCodeAdded }: UsePromoCodeFormProps) => {
  const { user, profile } = useAuth();
  const { subscriptionTier, maxOffers, bypassOfferLimits, refresh } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this is a fake account
  const isFakeAccount = profile?.is_fake === true;
  
  // Initialize form data with stored values if available
  const [formData, setFormData] = useState<PromoCodeFormData>(() => {
    const storedData = getStoredFormData();
    const defaultData = {
      brandName: "",
      brandUrl: "",
      brandInstagramHandle: "",
      promoCode: "",
      expirationDate: "",
      affiliateLink: "",
      description: "",
      category: "Fashion", // Default category
    };
    
    // Merge stored data with defaults
    return storedData ? { ...defaultData, ...storedData } : defaultData;
  });
  
  const [currentOfferCount, setCurrentOfferCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    // Only save if form has any meaningful data
    const hasData = Object.values(formData).some(value => value.trim() !== "" && value !== "Fashion");
    
    if (hasData) {
      saveFormData(formData);
    } else {
      clearStoredFormData();
    }
  }, [formData]);

  // Get the next tier for upgrade suggestions
  const getNextTier = () => {
    const currentTierIndex = SUBSCRIPTION_TIERS.findIndex(tier => tier.name === subscriptionTier);
    if (currentTierIndex < SUBSCRIPTION_TIERS.length - 1) {
      return SUBSCRIPTION_TIERS[currentTierIndex + 1];
    }
    return null;
  };
  
  const nextTier = getNextTier();

  // Fetch current offer count only when needed for real accounts
  useEffect(() => {
    const fetchOfferCount = async () => {
      if (!user) return;
      
      // For fake accounts, skip the count check entirely
      if (isFakeAccount) {
        console.log(`[PROMO_FORM] Fake account detected - skipping offer count check`);
        setCurrentOfferCount(0);
        setIsLoadingCount(false);
        return;
      }
      
      setIsLoadingCount(true);
      
      try {
        console.log(`[PROMO_FORM] Fetching offer count for real user: ${user.id}`);
        
        const { count, error } = await supabase
          .from('promo_codes')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', user.id);
        
        if (error) {
          console.error("[PROMO_FORM] Error fetching offer count:", error);
          throw error;
        }
        
        const currentCount = count || 0;
        setCurrentOfferCount(currentCount);
        
        console.log(`[PROMO_FORM] Current offer count: ${currentCount}, Max offers: ${maxOffers}, Fake account: ${isFakeAccount}, Bypass limits: ${bypassOfferLimits}`);
      } catch (err) {
        console.error("Error fetching offer count:", err);
        toast.error("Failed to fetch current offer count");
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchOfferCount();
  }, [user, maxOffers, isFakeAccount, bypassOfferLimits]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Auto-format Instagram handle
    if (name === 'brandInstagramHandle') {
      let formattedValue = value.trim();
      if (formattedValue && !formattedValue.startsWith('@')) {
        formattedValue = '@' + formattedValue;
      }
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Update domain mappings for all followers with brand_url as the ONLY source
  const updateFollowerDomains = async (influencerId: string, brandUrl: string | null) => {
    if (!influencerId || !brandUrl) return;
    
    try {
      // Extract domain from brand URL only
      const brandDomain = extractDomain(brandUrl);
      if (!brandDomain) {
        console.error("Could not extract domain from brand URL:", brandUrl);
        return;
      }
      
      console.log("Extracted domain for mapping:", brandDomain);
      
      // Get all followers of this influencer
      const { data: followers, error: followerError } = await supabase
        .from('user_domain_map')
        .select('user_id')
        .eq('influencer_id', influencerId)
        .limit(1000);
        
      if (followerError || !followers || followers.length === 0) return;
      
      // Add domain mapping for each follower
      for (const follower of followers) {
        await supabase
          .from('user_domain_map')
          .upsert({
            user_id: follower.user_id,
            influencer_id: influencerId,
            domain: brandDomain
          }, { 
            onConflict: 'user_id,influencer_id,domain',
            ignoreDuplicates: true 
          });
      }
      
      console.log(`Domain mappings updated for ${followers.length} followers with domain ${brandDomain}`);
    } catch (error) {
      console.error("Error updating follower domains:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log(`[PROMO_FORM] Form submission started - User: ${user?.id}, Data:`, formData);
    
    if (!user) {
      console.error("[PROMO_FORM] No user found");
      toast.error("You must be logged in to add promo codes");
      return;
    }

    // Basic validation - form component should handle detailed validation
    if (!formData.brandName || !formData.brandUrl || !formData.promoCode || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For fake accounts, completely bypass subscription checks
    if (isFakeAccount) {
      console.log(`[PROMO_FORM] Fake account - bypassing all subscription checks`);
    } else {
      // Check subscription limits for real accounts only
      if (!bypassOfferLimits && currentOfferCount >= maxOffers) {
        console.log(`[PROMO_FORM] Subscription limit reached - Current: ${currentOfferCount}, Max: ${maxOffers}, Tier: ${subscriptionTier}`);
        
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
          description: `Upgrade to ${requiredTier} for more offer slots.`,
          action: {
            label: `Upgrade to ${requiredTier}`,
            onClick: () => window.location.href = "/pricing"
          },
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      console.log(`[PROMO_FORM] Attempting to insert promo code for user: ${user.id}`);
      
      const { error, data } = await supabase.from("promo_codes").insert({
        influencer_id: user.id,
        brand_name: formData.brandName,
        brand_url: formData.brandUrl,
        brand_instagram_handle: formData.brandInstagramHandle || '',
        promo_code: formData.promoCode,
        description: formData.description,
        expiration_date: formData.expirationDate || null,
        affiliate_link: formData.affiliateLink,
        category: formData.category,
      }).select();

      if (error) {
        console.error("[PROMO_FORM] Error adding promo code:", error);
        toast.error(`Failed to add promo code: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[PROMO_FORM] Successfully added promo code: ${data[0].id}`);
        
        // Update domain mappings for all followers with brand_url as the ONLY source
        await updateFollowerDomains(user.id, formData.brandUrl);

        toast.success("Promo code added successfully!");
        
        // Clear stored form data on successful submission
        clearStoredFormData();
        
        // Reset form
        setFormData({
          brandName: "",
          brandUrl: "",
          brandInstagramHandle: "",
          promoCode: "",
          expirationDate: "",
          affiliateLink: "",
          description: "",
          category: "Fashion",
        });
        
        // Update the current offer count only for real accounts
        if (!isFakeAccount) {
          setCurrentOfferCount(prev => prev + 1);
          
          // Refresh subscription data to ensure we have the latest limits
          await refresh();
          
          // Show upgrade suggestions if approaching the limit
          if (!bypassOfferLimits && currentOfferCount + 1 >= maxOffers - 1 && nextTier) {
            toast("Running out of offer slots!", {
              description: `You have ${maxOffers - (currentOfferCount + 1)} slots left. Consider upgrading to ${nextTier.name} for ${nextTier.maxOffers} offers.`,
              action: {
                label: "Upgrade Plan",
                onClick: () => window.location.href = "/pricing"
              }
            });
          }
        }
        
        // Notify parent component
        onPromoCodeAdded();
      } else {
        console.error("[PROMO_FORM] No data returned from promo code insert");
        toast.error("Failed to add promo code: No data returned");
      }
    } catch (error) {
      console.error("[PROMO_FORM] Unexpected error adding promo code:", error);
      toast.error("An unexpected error occurred while adding the promo code");
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
