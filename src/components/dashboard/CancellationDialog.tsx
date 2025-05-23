
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface CancellationDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  handleCancelSubscription: () => Promise<void>;
  isCanceling: boolean;
  promoCodes: any[];
}

const CancellationDialog = ({
  showDialog,
  setShowDialog,
  handleCancelSubscription,
  isCanceling,
  promoCodes
}: CancellationDialogProps) => {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancel Subscription
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your subscription? Your plan benefits will continue until the end of the current billing period.
            {promoCodes.length > 1 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
                You currently have {promoCodes.length} promo codes. You can only cancel your subscription if you have 1 or fewer promo codes active. Please remove your additional promo codes first.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancelSubscription();
            }}
            disabled={isCanceling || promoCodes.length > 1}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCanceling ? "Canceling..." : "Yes, Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancellationDialog;
