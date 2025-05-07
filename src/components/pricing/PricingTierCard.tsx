
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  isLoading,
  loadingPlan,
  onSubscribe
}: PricingTierProps) => {
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
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-4">
          <div className="text-4xl font-bold">{price}</div>
          {price !== "Free" && (
            <div className="text-sm text-muted-foreground mt-1">per month</div>
          )}
          {costPerOffer && (
            <div className="text-sm text-muted-foreground mt-1">
              {costPerOffer}
            </div>
          )}
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
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
          variant={highlighted ? "default" : "outline"}
          onClick={() => onSubscribe({id, name})}
          disabled={loadingPlan !== null}
        >
          {loadingPlan === id ? (
            "Processing..."
          ) : (
            ctaText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
