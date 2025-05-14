
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";
import { PricingTiersGrid, PricingTier } from "@/components/pricing/PricingTiersGrid";
import { RefundGuarantee } from "@/components/pricing/RefundGuarantee";
import { trackConversion, getReferralId } from "@/lib/rewardful";
import { AlertCircle } from "lucide-react";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createCheckoutSession, subscriptionTier, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  // Update the pricing tiers based on the bypass flag
  const pricingTiers: PricingTier[] = [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Offer Alert",
      features: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : "Upload 1 offer",
        "Appear in user search results", 
        "Feature in AI deal notifications",
        "Cancel anytime"
      ],
      ctaText: "Get Started",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 1
    },
    {
      id: "boost",
      name: "Boost",
      price: "$12",
      description: "For new influencers growing their audience",
      features: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : "Upload up to 3 offers",
        "Improve earning potential",
        "Enhanced search exposure",
        "Cancel anytime"
      ],
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$4.00/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 3
    },
    {
      id: "growth",
      name: "Growth",
      price: "$29",
      description: "Ideal for influencers scaling their business",
      features: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : "Upload up to 10 offers",
        "Increased exposure across Offer Alert",
        "Priority in search results",
        "Cancel anytime"
      ],
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$2.90/offer",
      ctaText: "Upgrade Now",
      highlighted: true,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : "Popular",
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 10
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      description: "Best for full-time influencers",
      features: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : "Upload up to 20 offers",
        "Featured exposure and alert prioritization",
        "Expand reach outside of your network",
        "Cancel anytime"
      ],
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$2.45/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 20
    },
    {
      id: "elite",
      name: "Elite",
      price: "$499",
      description: "For agencies and high-volume partners",
      features: [
        "Upload unlimited offers",
        "Custom user journey development",
        "Direct support from the Offer Alert team",
        "Cancel anytime"
      ],
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: null,
      maxOffers: Infinity
    }
  ];

  useEffect(() => {
    // Check for query params after successful subscription checkout
    const params = new URLSearchParams(window.location.search);
    const subscriptionStatus = params.get('subscription');
    const plan = params.get('plan');
    const sessionId = params.get('session_id');
    
    if (subscriptionStatus === 'success' && plan) {
      toast.success(`Successfully subscribed to ${plan} plan!`);
      
      // Track conversion with Rewardful if session ID is present
      if (sessionId) {
        console.log("Tracking conversion with Rewardful", { sessionId, plan });
        
        // Get subscription value based on plan
        let value = 0;
        switch (plan) {
          case "Boost":
            value = 12;
            break;
          case "Growth":
            value = 29;
            break;
          case "Pro":
            value = 49;
            break;
          case "Elite":
            value = 499;
            break;
          default:
            value = 0;
        }
        
        // Track the conversion with Rewardful
        trackConversion({
          orderId: sessionId,
          value: value,
          currency: 'USD',
          email: user?.email,
          customerId: user?.id
        });
        
        console.log("Conversion tracked", { 
          orderId: sessionId, 
          value, 
          email: user?.email, 
          customerId: user?.id 
        });
      }
      
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'canceled') {
      toast.info("Subscription process was canceled");
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const handleSubscribe = async (tier) => {
    if (!user) {
      toast.info(`Please sign up as an influencer to select the ${tier.name} plan`);
      navigate('/signup?tab=influencer');
      return;
    }
    
    if (!profile?.is_influencer) {
      toast.info("You need to be an influencer to subscribe");
      navigate('/influencer-apply');
      return;
    }

    // If user is already on this plan, navigate to dashboard
    if (subscriptionTier === tier.name) {
      toast.info(`You are already on the ${tier.name} plan`);
      navigate('/influencer-dashboard');
      return;
    }
    
    // For free tier, just navigate to dashboard
    if (tier.id === "starter") {
      navigate('/influencer-dashboard');
      return;
    }
    
    try {
      setLoadingPlan(tier.id);
      
      // Get referral ID from localStorage if it exists
      const referralId = getReferralId();
      console.log("Getting referral ID:", referralId);
      
      // Pass special product ID for Boost plan
      let productId = null;
      if (tier.id === "boost") {
        productId = "prod_SH4j01JgfxJSfl";
      }
      
      const checkoutUrl = await createCheckoutSession(tier.name as any, productId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Influencer Pricing Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your creator journey. All plans are monthly with no long-term contracts.
        </p>
      </div>

      {/* Special Promotion Banner */}
      {BYPASS_OFFER_LIMITS && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-green-800 dark:text-green-300">
              Limited Time Promotion: Unlimited Offers on All Plans!
            </h3>
          </div>
          <p className="text-green-700 dark:text-green-400">
            We're temporarily removing offer limits on all subscription tiers. Subscribe to any plan 
            and get unlimited promo code submissions! Regular limits will be restored later.
          </p>
        </div>
      )}

      <PricingTiersGrid 
        pricingTiers={pricingTiers}
        isLoading={isLoading}
        loadingPlan={loadingPlan}
        onSubscribe={handleSubscribe}
      />

      <RefundGuarantee />
    </div>
  );
};

export default PricingPage;
