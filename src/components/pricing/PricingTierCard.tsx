import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useMetaTracking } from "@/hooks/useMetaTracking";
import { createCheckoutPayload, extractNumericPrice } from "@/utils/metaTrackingHelpers";

export interface PricingTierProps {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
  badge: string | null;
  costPerOffer?: string;
  maxOffers: number;
  isEnquiry?: boolean;
  isLoading: boolean;
  loadingPlan: string | null;
  onSubscribe: (tier: any) => void;
}

export const PricingTierCard = ({
  id,
  name,
  price,
  description,
  features,
  ctaText,
  highlighted,
  badge,
  costPerOffer,
  maxOffers,
  isEnquiry,
  isLoading,
  loadingPlan,
  onSubscribe
}: PricingTierProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const { track } = useMetaTracking();
  
  // Handle the click with a slight delay to ensure tracking completes
  const handleSubscribeClick = () => {
    setIsClicked(true);
    
    // Track InitiateCheckout event with enhanced details using our helper
    const eventData = createCheckoutPayload({
      content_name: name,
      content_ids: [id],
      value: extractNumericPrice(price),
      currency: 'USD',
    });
    
    // Use our enhanced tracking method that does both client & server-side tracking
    track('InitiateCheckout', eventData);
    
    // Log tracking for debugging
    console.log(`[Meta Tracking] Tracking InitiateCheckout for ${name} plan`);
    
    // Ensure pixel has time to fire before navigation
    setTimeout(() => {
      onSubscribe({id, name});
      setIsClicked(false);
    }, 300);
  };

  return (
    <Card 
      className={`relative flex flex-col ${
        highlighted 
          ? 'border-primary shadow-lg scale-105' 
          : ''
      }`}
    >
      {badge && (
        <Badge 
          className="absolute -top-3 right-4 bg-primary hover:bg-primary"
        >
          {badge}
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-4">
          <div className="text-3xl font-bold">{price}</div>
          {price !== "Free" && price !== "Custom" && (
            <div className="text-sm text-muted-foreground mt-1">per month</div>
          )}
          {costPerOffer && (
            <div className="text-sm text-muted-foreground mt-1">
              {costPerOffer}
            </div>
          )}
        </div>
        
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          variant={highlighted ? "default" : "outline"}
          onClick={handleSubscribeClick}
          disabled={isLoading || loadingPlan !== null || isClicked}
          id={`checkout-button-${id}`}
          data-plan-name={name}
          data-plan-price={extractNumericPrice(price)}
        >
          {isClicked ? (
            "Processing..."
          ) : loadingPlan === id ? (
            "Processing..."
          ) : (
            ctaText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
