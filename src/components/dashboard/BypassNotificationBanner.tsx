
import { AlertCircle } from "lucide-react";

interface BypassNotificationBannerProps {
  show: boolean;
}

const BypassNotificationBanner = ({ show }: BypassNotificationBannerProps) => {
  if (!show) return null;
  
  return (
    <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      <div>
        <h3 className="font-semibold text-green-800 dark:text-green-300">Limited Time Promotion</h3>
        <p className="text-green-700 dark:text-green-400 text-sm">
          We're temporarily allowing unlimited promo code submissions for all influencers. Keep adding offers with no limits!
        </p>
      </div>
    </div>
  );
};

export default BypassNotificationBanner;
