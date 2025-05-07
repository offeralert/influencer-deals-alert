
import { PricingTierCard } from "./PricingTierCard";

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
  badge: string | null;
  costPerOffer?: string;
}

interface PricingTiersGridProps {
  pricingTiers: PricingTier[];
  isLoading: boolean;
  loadingPlan: string | null;
  onSubscribe: (tier: any) => void;
}

export const PricingTiersGrid = ({
  pricingTiers,
  isLoading,
  loadingPlan,
  onSubscribe
}: PricingTiersGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {pricingTiers.map((tier) => (
        <PricingTierCard
          key={tier.id}
          {...tier}
          isLoading={isLoading}
          loadingPlan={loadingPlan}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
};
