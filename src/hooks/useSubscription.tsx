
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SubscriptionTier = "Starter" | "Boost" | "Growth" | "Pro" | "Elite";

interface SubscriptionData {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  maxOffers: number;
  isLoading: boolean;
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

  // Calculate max offers based on subscription tier
  const maxOffers = useCallback(() => {
    switch (subscriptionTier) {
      case "Boost": return 3;
      case "Growth": return 10;
      case "Pro": return 20;
      case "Elite": return Infinity; // Effectively unlimited
      default: return 1; // Starter tier
    }
  }, [subscriptionTier]);

  const refresh = useCallback(async () => {
    if (!user || !profile?.is_influencer) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast.error("Failed to check subscription status");
        return;
      }
      
      if (data) {
        setSubscribed(data.subscribed);
        setSubscriptionTier(data.subscription_tier || "Starter");
        setSubscriptionEnd(data.subscription_end);
      }
    } catch (error) {
      console.error("Error in subscription check:", error);
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
        body: { planType, productId }
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

      return data?.url || null;
    } catch (error) {
      console.error("Error in openCustomerPortal:", error);
      toast.error("Failed to open customer portal");
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
    refresh,
    createCheckoutSession,
    openCustomerPortal
  };
};
