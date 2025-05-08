
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";
import { PricingTiersGrid, PricingTier } from "@/components/pricing/PricingTiersGrid";
import { RefundGuarantee } from "@/components/pricing/RefundGuarantee";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createCheckoutSession, subscriptionTier, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const pricingTiers: PricingTier[] = [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Offer Alert",
      features: [
        "Upload 1 offer",
        "Appear in user search results", 
        "Feature in AI deal notifications",
        "Cancel anytime"
      ],
      ctaText: "Get Started",
      highlighted: false,
      badge: null,
      maxOffers: 1
    },
    {
      id: "boost",
      name: "Boost",
      price: "$12",
      description: "For new influencers growing their audience",
      features: [
        "Upload up to 3 offers",
        "Improve earning potential",
        "Enhanced search exposure",
        "Cancel anytime"
      ],
      costPerOffer: "~$4.00/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: null,
      maxOffers: 3
    },
    {
      id: "growth",
      name: "Growth",
      price: "$29",
      description: "Ideal for influencers scaling their business",
      features: [
        "Upload up to 10 offers",
        "Increased exposure across Offer Alert",
        "Priority in search results",
        "Cancel anytime"
      ],
      costPerOffer: "~$2.90/offer",
      ctaText: "Upgrade Now",
      highlighted: true,
      badge: "Popular",
      maxOffers: 10
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      description: "Best for full-time influencers",
      features: [
        "Upload up to 20 offers",
        "Featured exposure and alert prioritization",
        "Expand reach outside of your network",
        "Cancel anytime"
      ],
      costPerOffer: "~$2.45/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: null,
      maxOffers: 20
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
    
    if (subscriptionStatus === 'success' && plan) {
      toast.success(`Successfully subscribed to ${plan} plan!`);
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'canceled') {
      toast.info("Subscription process was canceled");
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
