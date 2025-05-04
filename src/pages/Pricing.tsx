
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PricingPage = () => {
  const navigate = useNavigate();
  
  const pricingTiers = [
    {
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
      name: "Enterprise",
      price: "$499",
      description: "Ideal for agencies and high-volume partners",
      features: [
        "Upload unlimited offers",
        "Custom user journey development",
        "Direct support from the Offer Alert team",
        "Cancel anytime"
      ],
      ctaText: "Apply Now",
      highlighted: false,
      badge: null
    }
  ];

  const handleSignup = (tier) => {
    toast.info(`Selected the ${tier} plan`);
    navigate('/signup?tab=influencer');
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
                onClick={() => handleSignup(tier.name)}
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
