import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export type SubscriptionTier = "Starter" | "Boost" | "Growth" | "Pro" | "Elite";

// Set to false to enforce proper subscription limits
export const BYPASS_OFFER_LIMITS = false;

interface AgencySubscriptionData {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  maxOffers: number;
  totalPromoCodesUsed: number;
  isLoading: boolean;
  bypassOfferLimits: boolean;
  refresh: () => Promise<void>;
  createCheckoutSession: (planType: SubscriptionTier, productId?: string | null) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
  error: string | null;
}

export const useAgencySubscription = (): AgencySubscriptionData => {
  const { user, profile, isReady, isAgency } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("Starter");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a fake account - this determines unlimited uploads
  const isFakeAccount = profile?.is_fake === true;

  // Query to count total promo codes across all managed influencers
  const { data: totalPromoCodesUsed = 0 } = useQuery({
    queryKey: ['agency-total-promo-codes', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAgency) return 0;

      // First get all managed influencer IDs
      const { data: managedInfluencers, error: influencersError } = await supabase
        .from('agency_influencers')
        .select('influencer_id')
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (influencersError) throw influencersError;
      
      const influencerIds = managedInfluencers?.map(inf => inf.influencer_id) || [];
      
      if (influencerIds.length === 0) return 0;

      // Count promo codes for all managed influencers
      const { data, error } = await supabase
        .from('promo_codes')
        .select('id', { count: 'exact' })
        .in('influencer_id', influencerIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && !!isAgency,
  });

  // Calculate max offers based on subscription tier and fake account status
  const maxOffers = useMemo(() => {
    console.log(`[AGENCY-SUBSCRIPTION] Calculating max offers - Fake account: ${isFakeAccount}, Global bypass: ${BYPASS_OFFER_LIMITS}, Tier: ${subscriptionTier}`);
    
    // If bypassing limits globally or if this is a fake account, return unlimited
    if (BYPASS_OFFER_LIMITS || isFakeAccount) {
      console.log(`[AGENCY-SUBSCRIPTION] Bypassing limits - Global bypass: ${BYPASS_OFFER_LIMITS}, Fake account: ${isFakeAccount}`);
      return Infinity;
    }
    
    // Proper tier-based limits for real accounts
    switch (subscriptionTier) {
      case "Boost": return 3;
      case "Growth": return 10;
      case "Pro": return 20;
      case "Elite": return Infinity; // Effectively unlimited
      default: return 1; // Starter tier
    }
  }, [subscriptionTier, isFakeAccount]);

  // Determine if we should bypass offer limits
  const bypassOfferLimits = BYPASS_OFFER_LIMITS || isFakeAccount;

  const refresh = useCallback(async () => {
    console.log(`[AGENCY-SUBSCRIPTION] Starting refresh - User: ${user?.id}, Auth ready: ${isReady}, Is agency: ${isAgency}, Is fake: ${isFakeAccount}`);
    
    // Don't proceed if we don't have the basic requirements
    if (!user || !isReady || isAgency === undefined) {
      console.log(`[AGENCY-SUBSCRIPTION] Not ready for refresh - User: ${!!user}, Ready: ${isReady}, Agency defined: ${isAgency !== undefined}`);
      return;
    }

    // Check if user is an agency
    if (!isAgency) {
      console.log(`[AGENCY-SUBSCRIPTION] User is not an agency, skipping subscription check`);
      return;
    }

    // For fake accounts, skip the expensive subscription check entirely
    if (isFakeAccount) {
      console.log("[AGENCY-SUBSCRIPTION] Fake account detected - bypassing subscription check");
      setSubscribed(false);
      setSubscriptionTier("Starter");
      setSubscriptionEnd(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[AGENCY-SUBSCRIPTION] Checking subscription status for agency:", user.id);
      
      const { data, error: funcError } = await supabase.functions.invoke('check-subscription');
      
      if (funcError) {
        console.error("[AGENCY-SUBSCRIPTION] Error checking subscription:", funcError);
        setError(`Failed to check subscription: ${funcError.message}`);
        toast.error("Failed to check subscription status");
        return;
      }
      
      if (data) {
        console.log("[AGENCY-SUBSCRIPTION] Subscription data received:", data);
        setSubscribed(data.subscribed || false);
        setSubscriptionTier(data.subscription_tier || "Starter");
        setSubscriptionEnd(data.subscription_end || null);
        
        // Log the tier and max offers for debugging
        const tier = data.subscription_tier || "Starter";
        let maxOffersForTier = 1;
        switch (tier) {
          case "Boost": maxOffersForTier = 3; break;
          case "Growth": maxOffersForTier = 10; break;
          case "Pro": maxOffersForTier = 20; break;
          case "Elite": maxOffersForTier = Infinity; break;
        }
        console.log(`[AGENCY-SUBSCRIPTION] Agency has ${tier} tier with ${maxOffersForTier} max offers`);
      } else {
        console.warn("[AGENCY-SUBSCRIPTION] No data returned from check-subscription function");
        setError("No subscription data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[AGENCY-SUBSCRIPTION] Error in subscription check:", errorMessage);
      setError(`Subscription check failed: ${errorMessage}`);
      toast.error("Failed to check subscription status");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isReady, isAgency, isFakeAccount]);

  const createCheckoutSession = useCallback(async (
    planType: SubscriptionTier, 
    productId: string | null = null
  ): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return null;
    }

    try {
      console.log(`[AGENCY-SUBSCRIPTION] Creating checkout session for plan: ${planType}`);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType, 
          productId
        }
      });

      if (error) {
        console.error("[AGENCY-SUBSCRIPTION] Error creating checkout:", error);
        toast.error(`Failed to create checkout session: ${error.message}`);
        return null;
      }

      console.log("[AGENCY-SUBSCRIPTION] Checkout session created successfully");
      return data?.url || null;
    } catch (error) {
      console.error("[AGENCY-SUBSCRIPTION] Error in createCheckoutSession:", error);
      toast.error("Failed to create checkout session");
      return null;
    }
  }, [user]);

  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to manage your subscription");
      return null;
    }

    try {
      console.log("[AGENCY-SUBSCRIPTION] Opening customer portal");
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error("[AGENCY-SUBSCRIPTION] Error opening customer portal:", error);
        toast.error(`Failed to open customer portal: ${error.message}`);
        return null;
      }

      if (!data?.url) {
        console.error("[AGENCY-SUBSCRIPTION] No portal URL returned from function");
        toast.error("Failed to open customer portal: No portal URL returned");
        return null;
      }

      console.log("[AGENCY-SUBSCRIPTION] Customer portal opened successfully");
      return data.url;
    } catch (error) {
      console.error("[AGENCY-SUBSCRIPTION] Error in openCustomerPortal:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to open customer portal: ${errorMessage}`);
      return null;
    }
  }, [user]);

  // Effect to trigger refresh when dependencies change
  useEffect(() => {
    // Only refresh when we have all the required state and it's stable
    if (user && isReady && isAgency !== undefined) {
      console.log("[AGENCY-SUBSCRIPTION] Dependencies changed, triggering refresh");
      refresh();
    }
  }, [user?.id, isReady, isAgency, isFakeAccount, refresh]);

  return {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    maxOffers,
    totalPromoCodesUsed,
    isLoading,
    bypassOfferLimits,
    refresh,
    createCheckoutSession,
    openCustomerPortal,
    error
  };
};