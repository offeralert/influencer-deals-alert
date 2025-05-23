
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubscriptionTier } from "@/hooks/useSubscription";

interface SubscriptionStatusCardProps {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  promoCodes: any[];
  maxOffers: number;
  bypassOfferLimits: boolean;
  refreshingSubscription: boolean;
  handleManualRefresh: () => void;
  handleManageSubscription: () => void;
  setShowCancelDialog: (show: boolean) => void;
  isCanceling: boolean;
}

const SubscriptionStatusCard = ({
  subscribed,
  subscriptionTier,
  subscriptionEnd,
  promoCodes,
  maxOffers,
  bypassOfferLimits,
  refreshingSubscription,
  handleManualRefresh,
  handleManageSubscription,
  setShowCancelDialog,
  isCanceling
}: SubscriptionStatusCardProps) => {
  const navigate = useNavigate();
  
  const formatSubscriptionEndDate = (dateString: string | null) => {
    if (!dateString) return "No active subscription";
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold mb-1">Subscription Status</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleManualRefresh}
                disabled={refreshingSubscription}
              >
                <RefreshCcw className={`h-4 w-4 ${refreshingSubscription ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh subscription status</span>
              </Button>
            </div>
            <p className="text-muted-foreground">
              {subscribed 
                ? `${subscriptionTier} plan • Renews: ${formatSubscriptionEndDate(subscriptionEnd)}`
                : "Starter plan (Free)"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Offers</div>
              <div className="font-semibold">
                {promoCodes.length} / {bypassOfferLimits ? "Unlimited" : maxOffers}
              </div>
            </div>
            
            {subscribed ? (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                >
                  Manage Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCanceling}
                >
                  Cancel Subscription
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="whitespace-nowrap"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
