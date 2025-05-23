
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  handleManageSubscription: () => void;
  setShowCancelDialog: (show: boolean) => void;
  isCanceling: boolean;
  subscribed: boolean;
}

const DashboardHeader = ({ 
  handleManageSubscription, 
  setShowCancelDialog, 
  isCanceling,
  subscribed 
}: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Influencer Dashboard</h1>
      
      <div className="flex items-center gap-2">
        {subscribed ? (
          <>
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
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardHeader;
