
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
          Using {currentOfferCount} of {bypassOfferLimits 
            ? "unlimited (temporary promotion)" 
            : (maxOffers === Infinity ? "unlimited" : maxOffers)} available offers
        </div>
      </div>
      
      {bypassOfferLimits && (
        <div className="flex items-center bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-md text-green-800 dark:text-green-300 text-xs">
          <Info className="h-3 w-3 mr-1" />
          <span>Unlimited promo submissions enabled!</span>
        </div>
      )}
      
      {!bypassOfferLimits && nextTier && (
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
