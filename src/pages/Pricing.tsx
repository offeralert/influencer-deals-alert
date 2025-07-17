
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { useAgencySubscription } from "@/hooks/useAgencySubscription";
import { useEffect, useState } from "react";
import { PricingTiersGrid, PricingTier } from "@/components/pricing/PricingTiersGrid";
import { RefundGuarantee } from "@/components/pricing/RefundGuarantee";
import { AlertCircle } from "lucide-react";
import { useMetaTracking } from "@/hooks/useMetaTracking";
import { createSubscriptionPayload, getPlanValue } from "@/utils/metaTrackingHelpers";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, profile, isInfluencer, isAgency } = useAuth();
  
  // Use appropriate subscription hook based on user type
  const influencerSubscription = useSubscription();
  const agencySubscription = useAgencySubscription();
  
  // Determine which subscription data to use
  const isUserAgency = isAgency && !isInfluencer;
  const {
    createCheckoutSession,
    subscriptionTier,
    isLoading
  } = isUserAgency ? agencySubscription : influencerSubscription;
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { track } = useMetaTracking();
  
  // Update the pricing tiers based on the bypass flag and user type
  const getDescription = (baseTier: string) => {
    if (isUserAgency) {
      switch (baseTier) {
        case "starter":
          return "Perfect for agencies getting started";
        case "boost":
          return "For agencies managing small influencer networks";
        case "growth":
          return "Ideal for agencies scaling their operations";
        case "pro":
          return "Best for full-service agencies";
        case "elite":
          return "Custom solutions for enterprise agencies";
        default:
          return "Perfect for getting started with Offer Alert";
      }
    }
    return {
      starter: "Perfect for trying out Offer Alert",
      boost: "For new influencers growing their audience",
      growth: "Ideal for influencers scaling their business",
      pro: "Best for full-time influencers",
      elite: "For agencies and high-volume partners"
    }[baseTier] || "Perfect for getting started with Offer Alert";
  };

  const getFeatures = (tierId: string, maxOffers: number) => {
    const baseFeatures = {
      starter: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : `Upload ${maxOffers} offer${maxOffers > 1 ? 's' : ''}`,
        isUserAgency ? "Manage influencer network" : "Appear in user search results",
        isUserAgency ? "Agency dashboard & analytics" : "Feature in AI deal notifications",
        "Cancel anytime"
      ],
      boost: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : `Upload up to ${maxOffers} offers`,
        isUserAgency ? "Enhanced network management" : "Improve earning potential",
        isUserAgency ? "Bulk operations for influencers" : "Enhanced search exposure", 
        "Cancel anytime"
      ],
      growth: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : `Upload up to ${maxOffers} offers`,
        isUserAgency ? "Advanced analytics & reporting" : "Increased exposure across Offer Alert",
        isUserAgency ? "Priority support" : "Priority in search results",
        "Cancel anytime"
      ],
      pro: [
        BYPASS_OFFER_LIMITS ? "Upload unlimited offers (limited time)" : `Upload up to ${maxOffers} offers`,
        isUserAgency ? "White-label solutions" : "Featured exposure and alert prioritization",
        isUserAgency ? "Custom integrations" : "Expand reach outside of your network",
        "Cancel anytime"
      ],
      elite: [
        "Upload unlimited offers",
        isUserAgency ? "Enterprise-grade solutions" : "Custom user journey development",
        isUserAgency ? "Dedicated account manager" : "Direct support from the Offer Alert team",
        isUserAgency ? "Custom SLA and support" : "Tailored solutions for your needs"
      ]
    };
    return baseFeatures[tierId] || baseFeatures.starter;
  };

  const pricingTiers: PricingTier[] = [
    {
      id: "starter",
      name: "Starter", 
      price: "Free",
      description: getDescription("starter"),
      features: getFeatures("starter", BYPASS_OFFER_LIMITS ? Infinity : 1),
      ctaText: "Get Started",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 1
    },
    {
      id: "boost",
      name: "Boost",
      price: "$5",
      description: getDescription("boost"),
      features: getFeatures("boost", BYPASS_OFFER_LIMITS ? Infinity : 3),
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$1.67/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 3
    },
    {
      id: "growth",
      name: "Growth",
      price: "$12",
      description: getDescription("growth"),
      features: getFeatures("growth", BYPASS_OFFER_LIMITS ? Infinity : 10),
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$1.20/offer",
      ctaText: "Upgrade Now",
      highlighted: true,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : "Popular",
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 10
    },
    {
      id: "pro",
      name: "Pro",
      price: "$20",
      description: getDescription("pro"),
      features: getFeatures("pro", BYPASS_OFFER_LIMITS ? Infinity : 20),
      costPerOffer: BYPASS_OFFER_LIMITS ? "~$0/offer (limited time)" : "~$1.00/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: BYPASS_OFFER_LIMITS ? "Promo" : null,
      maxOffers: BYPASS_OFFER_LIMITS ? Infinity : 20
    },
    {
      id: "elite",
      name: "Elite",
      price: "Custom",
      description: getDescription("elite"),
      features: getFeatures("elite", Infinity),
      ctaText: "Contact Us",
      highlighted: false,
      badge: null,
      maxOffers: Infinity,
      isEnquiry: true
    }
  ];

  useEffect(() => {
    // Check for query params after successful subscription checkout
    const params = new URLSearchParams(window.location.search);
    const subscriptionStatus = params.get('subscription');
    const plan = params.get('plan');
    
    if (subscriptionStatus === 'success' && plan) {
      toast.success(`Successfully subscribed to ${plan} plan!`);
      
      // Track successful subscription completion with our helper
      const subscriptionPayload = createSubscriptionPayload({
        content_name: plan,
        value: getPlanValue(plan),
        currency: 'USD'
      });
      
      track('SubscriptionComplete', subscriptionPayload);
      
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'canceled') {
      toast.info("Subscription process was canceled");
      // Remove the query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, track]);

  // Helper function to get plan monetary value for tracking
  const getPlanValue = (planName: string): number => {
    switch (planName) {
      case 'Boost': return 5;
      case 'Growth': return 12;
      case 'Pro': return 20;
      case 'Elite': return 499;
      default: return 0;
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
      const userType = isUserAgency ? "agency" : "influencer";
      toast.info(`Please sign up to select the ${tier.name} plan`);
      navigate(`/signup?tab=${userType}`);
      return;
    }
    
    // Check if user is eligible (either influencer or agency)
    if (!isInfluencer && !isAgency) {
      toast.info("Please complete your profile to subscribe");
      navigate('/influencer-apply');
      return;
    }

    // Track subscription initiated event using our helper
    const subscriptionPayload = createSubscriptionPayload({
      content_name: tier.name,
      content_category: 'subscription_plan',
      content_ids: [tier.id],
      value: getPlanValue(tier.name),
      currency: 'USD'
    });
    
    track('SubscriptionInitiated', subscriptionPayload);

    // If user is already on this plan, navigate to appropriate dashboard
    if (subscriptionTier === tier.name) {
      toast.info(`You are already on the ${tier.name} plan`);
      const dashboardRoute = isUserAgency ? '/agency-dashboard' : '/influencer-dashboard';
      navigate(dashboardRoute);
      return;
    }
    
    // For free tier, just navigate to appropriate dashboard
    if (tier.id === "starter") {
      const dashboardRoute = isUserAgency ? '/agency-dashboard' : '/influencer-dashboard';
      navigate(dashboardRoute);
      return;
    }
    
    // For Elite tier, redirect to contact page
    if (tier.id === "elite") {
      navigate('/contact?subject=Elite Plan Enquiry');
      return;
    }
    
    try {
      setLoadingPlan(tier.id);
      
      // Pass specific product ID for each plan
      let productId = null;
      if (tier.id === "boost") {
        productId = "prod_SH4j01JgfxJSfl"; // Boost plan
      } else if (tier.id === "growth") {
        productId = "prod_SGnRrAW83TfaUf"; // Growth plan
      } else if (tier.id === "pro") {
        productId = "prod_SGnSw59Chig0Yc"; // Pro plan
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
        <h1 className="text-4xl font-bold mb-4">
          {isUserAgency ? "Agency Pricing Plans" : "Influencer Pricing Plans"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isUserAgency 
            ? "Choose the perfect plan for your agency's growth. Manage unlimited influencers with flexible pricing." 
            : "Choose the perfect plan for your creator journey. All plans are monthly with no long-term contracts."
          }
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
