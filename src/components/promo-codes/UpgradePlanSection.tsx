
import React from "react";
import { Button } from "@/components/ui/button";

interface UpgradePlanSectionProps {
  currentOfferCount: number;
  maxOffers: number;
  subscriptionTier: string;
  nextTier: { name: string, maxOffers: number } | null;
  bypassOfferLimits: boolean;
}

const UpgradePlanSection = ({
  currentOfferCount,
  maxOffers,
  subscriptionTier,
  nextTier,
  bypassOfferLimits
}: UpgradePlanSectionProps) => {
  if (bypassOfferLimits) {
    return (
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center text-green-800 dark:text-green-300">
        <p className="text-sm">
          <span className="font-semibold">Limited time promotion:</span> Submit unlimited promo codes regardless of your plan tier!
        </p>
      </div>
    );
  }

  if (currentOfferCount >= maxOffers) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
        <p className="text-sm mb-3">
          You've reached your offer limit with the {subscriptionTier} plan.
          {nextTier && ` Upgrade to ${nextTier.name} for ${nextTier.maxOffers === Infinity ? 'unlimited' : nextTier.maxOffers} offers.`}
        </p>
        <Button 
          variant="default" 
          className="text-sm"
          onClick={() => window.location.href = "/pricing"}
        >
          Upgrade Plan
        </Button>
      </div>
    );
  }

  return null;
};

export default UpgradePlanSection;
