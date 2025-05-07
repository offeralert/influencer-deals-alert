
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createCheckoutSession, subscriptionTier, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const pricingTiers = [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Offer Alert",
      features: [
        "Upload 1 offer",
        "Appear in user search and category pages", 
        "Feature in AI deal notifications",
        "Cancel anytime"
      ],
      ctaText: "Get Started",
      highlighted: false,
      badge: null
    },
    {
      id: "growth",
      name: "Growth",
      price: "$29",
      description: "Ideal for influencers building their business",
      features: [
        "Upload up to 10 offers",
        "Improve earning potential",
        "Enhanced exposure across Offer Alert",
        "Cancel anytime"
      ],
      costPerOffer: "~$3.00/offer",
      ctaText: "Upgrade Now",
      highlighted: true,
      badge: "Recommended"
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
      costPerOffer: "~$2.50/offer",
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: null
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$499",
      description: "Ideal for agencies and high-volume partners",
      features: [
        "Upload unlimited offers",
        "Custom user journey development",
        "Direct support from the Offer Alert team",
        "Cancel anytime"
      ],
      ctaText: "Upgrade Now",
      highlighted: false,
      badge: null
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
      
      const checkoutUrl = await createCheckoutSession(tier.name as any);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.name}
            className={`relative flex flex-col ${
              tier.highlighted 
                ? 'border-primary shadow-lg scale-105' 
                : ''
            }`}
          >
            {tier.badge && (
              <Badge 
                className="absolute -top-3 right-4 bg-primary hover:bg-primary"
              >
                {tier.badge}
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="mb-4">
                <div className="text-4xl font-bold">{tier.price}</div>
                {tier.price !== "Free" && (
                  <div className="text-sm text-muted-foreground mt-1">per month</div>
                )}
                {tier.costPerOffer && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {tier.costPerOffer}
                  </div>
                )}
              </div>
              
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={tier.highlighted ? "default" : "outline"}
                onClick={() => handleSubscribe(tier)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === tier.id ? (
                  "Processing..."
                ) : (
                  tier.ctaText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We offer a 30-day full refund guarantee. If for any reason you are not satisfied with our product within 30 days of your purchase, we will gladly give you a full refund.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
