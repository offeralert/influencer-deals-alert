
import React from "react";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight, Crown } from "lucide-react";

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
  const isUnlimited = maxOffers === Infinity || bypassOfferLimits;
  
  return (
    <div className="flex justify-between items-center mb-6 bg-muted/30 p-4 rounded-lg">
      <div className="space-y-1">
        <div className="text-sm font-medium flex items-center">
          <span className="mr-2">Current plan:</span>
          <span className="font-semibold text-primary flex items-center gap-1">
            {subscriptionTier}
            {isUnlimited && <Crown className="h-4 w-4 text-yellow-500" />}
          </span>
        </div>
        <div className="text-sm flex items-center text-muted-foreground">
          {isUnlimited ? (
            <span className="text-green-600 font-medium">Unlimited offers available</span>
          ) : (
            <span>Using {currentOfferCount} of {maxOffers} available offers</span>
          )}
        </div>
        {isUnlimited && (
          <div className="text-xs text-green-600">
            You can upload as many promo codes as you need!
          </div>
        )}
      </div>
      
      {nextTier && !isUnlimited && (
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
