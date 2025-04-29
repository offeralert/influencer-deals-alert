import { Check, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const navigate = useNavigate();
  
  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for new influencers starting their journey",
      features: [
        "Upload up to 3 offers",
        "Access to real-time AI-powered notifications",
        "Perfect for new or casual influencers",
        "Cancel anytime"
      ],
      costPerOffer: "",
      ctaText: "Get Started",
      highlighted: false,
      badge: null
    },
    {
      name: "Growth",
      price: "$30",
      description: "Great for influencers with a few active brand deals",
      features: [
        "Upload up to 10 offers",
        "Enhanced exposure across Offer Alert",
        "Boost earning potential",
        "Cancel anytime"
      ],
      costPerOffer: "~$3.00/offer",
      ctaText: "Upgrade to Growth",
      highlighted: true,
      badge: "Recommended"
    },
    {
      name: "Pro",
      price: "$50",
      description: "Ideal for growing creators managing multiple campaigns",
      features: [
        "Upload up to 20 offers",
        "Priority feature in Notification Alert (coming soon)",
        "Expand reach to even more users",
        "Cancel anytime"
      ],
      costPerOffer: "~$2.50/offer",
      ctaText: "Upgrade to Pro",
      highlighted: false,
      badge: null
    },
    {
      name: "Enterprise",
      price: "$80",
      description: "Maximum flexibility for large influencers and corporations",
      features: [
        "Unlimited offers",
        "Custom user journey development",
        "Direct support from the Offer Alert team",
        "Cancel anytime"
      ],
      costPerOffer: "Best Value – unlimited uploads!",
      ctaText: "Upgrade to Enterprise",
      highlighted: false,
      badge: null
    }
  ];

  const handleGetStarted = () => {
    navigate('/signup?tab=influencer');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Influencer Pricing Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your creator journey. Upgrade, downgrade, or cancel anytime.
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
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Free" && <span className="text-muted-foreground">/month</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span>{tier.costPerOffer}</span>
                </div>
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
                onClick={handleGetStarted}
              >
                {tier.ctaText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
