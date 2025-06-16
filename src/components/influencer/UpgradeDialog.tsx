
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeDialog = ({ open, onClose }: UpgradeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Unlock additional features by upgrading your subscription plan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to access premium features and manage more promo codes.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/pricing">View Plans</Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
