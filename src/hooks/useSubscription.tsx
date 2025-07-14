import { useState, useEffect, useCallback } from "react";
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
}

export const useSubscription = (): SubscriptionData => {
  const { user, profile } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("Starter");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFakeAccount, setIsFakeAccount] = useState(false);

  // Calculate max offers based on subscription tier and fake account status
  const maxOffers = useCallback(() => {
    // If bypassing limits globally or if this is a fake account, return unlimited
    if (BYPASS_OFFER_LIMITS || isFakeAccount) {
      console.log(`[SUBSCRIPTION] Bypassing limits - Global bypass: ${BYPASS_OFFER_LIMITS}, Fake account: ${isFakeAccount}`);
      return Infinity;
    }
    
    // Proper tier-based limits
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
    if (!user || !profile?.is_influencer) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a fake account from the profile
      const isFake = profile?.is_fake || false;
      setIsFakeAccount(isFake);
      
      if (isFake) {
        console.log("[SUBSCRIPTION] Fake account detected - bypassing subscription check");
        setSubscribed(false);
        setSubscriptionTier("Starter");
        setSubscriptionEnd(null);
        setIsLoading(false);
        return;
      }

      console.log("[SUBSCRIPTION] Checking subscription status for user:", user.id);
      
      const { data, error: funcError } = await supabase.functions.invoke('check-subscription');
      
      if (funcError) {
        console.error("Error checking subscription:", funcError);
        setError(funcError.message || "Failed to check subscription status");
        toast.error("Failed to check subscription status");
        return;
      }
      
      if (data) {
        console.log("[SUBSCRIPTION] Subscription data received:", data);
        setSubscribed(data.subscribed);
        setSubscriptionTier(data.subscription_tier || "Starter");
        setSubscriptionEnd(data.subscription_end);
        
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error in subscription check:", errorMessage);
      setError(errorMessage);
      toast.error("Failed to check subscription status");
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  const createCheckoutSession = async (
    planType: SubscriptionTier, 
    productId: string | null = null
  ): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType, 
          productId
        }
      });

      if (error) {
        console.error("Error creating checkout:", error);
        toast.error(`Failed to create checkout session: ${error.message}`);
        return null;
      }

      return data?.url || null;
    } catch (error) {
      console.error("Error in createCheckoutSession:", error);
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
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error("Error opening customer portal:", error);
        toast.error(`Failed to open customer portal: ${error.message}`);
        return null;
      }

      if (!data?.url) {
        console.error("No portal URL returned from function");
        toast.error("Failed to open customer portal: No portal URL returned");
        return null;
      }

      return data.url;
    } catch (error) {
      console.error("Error in openCustomerPortal:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to open customer portal: ${errorMessage}`);
      return null;
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    maxOffers: maxOffers(),
    isLoading,
    bypassOfferLimits,
    refresh,
    createCheckoutSession,
    openCustomerPortal
  };
};
