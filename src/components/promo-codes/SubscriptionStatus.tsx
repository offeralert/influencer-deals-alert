
import React from "react";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight } from "lucide-react";

interface SubscriptionStatusProps {
  currentOfferCount: number;
  maxOffers: number;
  subscriptionTier: string;
  bypassOfferLimits: boolean;
  nextTier: { name: string, maxOffers: number } | null;
}

const SubscriptionStatus = ({
  currentOfferCount,
  maxOffers,
  subscriptionTier,
  bypassOfferLimits,
  nextTier
}: SubscriptionStatusProps) => {
  return (
    <div className="flex justify-between items-center mb-6 bg-muted/30 p-4 rounded-lg">
      <div className="space-y-1">
        <div className="text-sm font-medium flex items-center">
          <span className="mr-2">Current plan:</span>
          <span className="font-semibold text-primary">{subscriptionTier}</span>
        </div>
        <div className="text-sm flex items-center text-muted-foreground">
          Using {currentOfferCount} of {maxOffers === Infinity ? "unlimited" : maxOffers} available offers
        </div>
      </div>
      
      {nextTier && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => window.location.href = "/pricing"}
        >
          <span>Upgrade to {nextTier.name}</span>
          <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
