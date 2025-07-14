
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SubscriptionTier = "Starter" | "Boost" | "Growth" | "Pro" | "Elite";

// Set to false to enforce proper subscription limits
export const BYPASS_OFFER_LIMITS = false;

interface SubscriptionData {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  maxOffers: number;
  isLoading: boolean;
  bypassOfferLimits: boolean;
  refresh: () => Promise<void>;
  createCheckoutSession: (planType: SubscriptionTier, productId?: string | null) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
  error: string | null;
}

export const useSubscription = (): SubscriptionData => {
  const { user, profile, isReady, isInfluencer } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("Starter");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a fake account - this determines unlimited uploads
  const isFakeAccount = profile?.is_fake === true;

  // Calculate max offers based on subscription tier and fake account status
  const maxOffers = useMemo(() => {
    console.log(`[SUBSCRIPTION] Calculating max offers - Fake account: ${isFakeAccount}, Global bypass: ${BYPASS_OFFER_LIMITS}, Tier: ${subscriptionTier}`);
    
    // If bypassing limits globally or if this is a fake account, return unlimited
    if (BYPASS_OFFER_LIMITS || isFakeAccount) {
      console.log(`[SUBSCRIPTION] Bypassing limits - Global bypass: ${BYPASS_OFFER_LIMITS}, Fake account: ${isFakeAccount}`);
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
    console.log(`[SUBSCRIPTION] Starting refresh - User: ${user?.id}, Auth ready: ${isReady}, Is influencer: ${isInfluencer}, Is fake: ${isFakeAccount}`);
    
    // Don't proceed if we don't have a user or if auth is not ready
    if (!user || !isReady) {
      console.log(`[SUBSCRIPTION] Not ready for refresh - User: ${!!user}, Ready: ${isReady}`);
      return;
    }

    // Check if user is an influencer
    if (!isInfluencer) {
      console.log(`[SUBSCRIPTION] User is not an influencer, skipping subscription check`);
      return;
    }

    // For fake accounts, skip the expensive subscription check entirely
    if (isFakeAccount) {
      console.log("[SUBSCRIPTION] Fake account detected - bypassing subscription check");
      setSubscribed(false);
      setSubscriptionTier("Starter");
      setSubscriptionEnd(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[SUBSCRIPTION] Checking subscription status for real user:", user.id);
      
      const { data, error: funcError } = await supabase.functions.invoke('check-subscription');
      
      if (funcError) {
        console.error("[SUBSCRIPTION] Error checking subscription:", funcError);
        setError(`Failed to check subscription: ${funcError.message}`);
        toast.error("Failed to check subscription status");
        return;
      }
      
      if (data) {
        console.log("[SUBSCRIPTION] Subscription data received:", data);
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
        console.log(`[SUBSCRIPTION] User has ${tier} tier with ${maxOffersForTier} max offers`);
      } else {
        console.warn("[SUBSCRIPTION] No data returned from check-subscription function");
        setError("No subscription data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[SUBSCRIPTION] Error in subscription check:", errorMessage);
      setError(`Subscription check failed: ${errorMessage}`);
      toast.error("Failed to check subscription status");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isReady, isInfluencer, isFakeAccount]); // Removed user object and profile from dependencies

  const createCheckoutSession = async (
    planType: SubscriptionTier, 
    productId: string | null = null
  ): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return null;
    }

    try {
      console.log(`[SUBSCRIPTION] Creating checkout session for plan: ${planType}`);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType, 
          productId
        }
      });

      if (error) {
        console.error("[SUBSCRIPTION] Error creating checkout:", error);
        toast.error(`Failed to create checkout session: ${error.message}`);
        return null;
      }

      console.log("[SUBSCRIPTION] Checkout session created successfully");
      return data?.url || null;
    } catch (error) {
      console.error("[SUBSCRIPTION] Error in createCheckoutSession:", error);
      toast.error("Failed to create checkout session");
      return null;
    }
  };

  const openCustomerPortal = async (): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to manage your subscription");
      return null;
    }

    try {
      console.log("[SUBSCRIPTION] Opening customer portal");
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error("[SUBSCRIPTION] Error opening customer portal:", error);
        toast.error(`Failed to open customer portal: ${error.message}`);
        return null;
      }

      if (!data?.url) {
        console.error("[SUBSCRIPTION] No portal URL returned from function");
        toast.error("Failed to open customer portal: No portal URL returned");
        return null;
      }

      console.log("[SUBSCRIPTION] Customer portal opened successfully");
      return data.url;
    } catch (error) {
      console.error("[SUBSCRIPTION] Error in openCustomerPortal:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to open customer portal: ${errorMessage}`);
      return null;
    }
  };

  // Effect to trigger refresh when dependencies change
  useEffect(() => {
    // Only refresh when we have the minimum required state
    if (user && isReady && isInfluencer !== undefined) {
      console.log("[SUBSCRIPTION] Dependencies changed, triggering refresh");
      refresh();
    }
  }, [user?.id, isReady, isInfluencer, isFakeAccount]); // Stable dependencies only

  return {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    maxOffers,
    isLoading,
    bypassOfferLimits,
    refresh,
    createCheckoutSession,
    openCustomerPortal,
    error
  };
};
