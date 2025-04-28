
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PricingPage = () => {
  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for new or casual influencers",
      features: [
        "Upload up to 3 offers",
        "Access to real-time AI-powered notifications",
        "Get discovered by users shopping online"
      ],
      ctaText: "Get Started",
      highlighted: false,
      badge: null
    },
    {
      name: "Growth",
      price: "$20",
      description: "Ideal for growing influencers ready to expand",
      features: [
        "Upload up to 10 offers",
        "Enhanced exposure across Offer Alert",
        "Boost earning potential with more active deals",
        "Cancel anytime"
      ],
      ctaText: "Upgrade to Growth",
      highlighted: true,
      badge: "Recommended"
    },
    {
      name: "Pro",
      price: "$30",
      description: "For established influencers seeking more reach",
      features: [
        "Upload up to 15 offers",
        "Priority placement in select categories",
        "Expand reach to even more users",
        "Cancel anytime"
      ],
      ctaText: "Upgrade to Pro",
      highlighted: false,
      badge: null
    },
    {
      name: "Enterprise",
      price: "$40",
      description: "Maximum flexibility and support",
      features: [
        "Upload more than 15 offers",
        "Unlimited uploads and flexibility",
        "Direct support from the Offer Alert team",
        "Cancel anytime"
      ],
      ctaText: "Upgrade to Enterprise",
      highlighted: false,
      badge: null
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your influencer journey. Upgrade or downgrade anytime.
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
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "Free" && <span className="text-muted-foreground">/month</span>}
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
