import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Instagram, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const MobileFooter = () => {
  const { user, profile, isInfluencer } = useAuth();
  const navigate = useNavigate();
  
  const { 
    subscribed, 
    openCustomerPortal 
  } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 px-4 py-8 mt-8 border-t">
      <div className="space-y-6">
        {/* Subscription Management Section for Influencers */}
        {isInfluencer && subscribed && (
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h4 className="font-semibold mb-3 text-sm">Subscription</h4>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="justify-start"
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="justify-start"
                onClick={() => navigate("/influencer-dashboard?action=cancel")}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold gradient-text mb-3">Offer Alert</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Connect with your favorite influencers and discover exclusive deals.
          </p>
          <div className="flex space-x-4">
            <a 
              href="https://www.instagram.com/offeralert.io/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-brand-purple"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="mailto:hello@offeralert.io" 
              className="text-gray-500 hover:text-brand-purple"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">For Users</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/origin" className="text-sm text-gray-600 dark:text-gray-400">
                  Our Origin Story
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-gray-600 dark:text-gray-400">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm">For Influencers</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/signup?tab=influencer" 
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <UserPlus size={14} /> Apply Now
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 dark:text-gray-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/why-join" className="text-sm text-gray-600 dark:text-gray-400">
                  Why Join
                </Link>
              </li>
              <li>
                <Link to="/influencer-dashboard" className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4 border-t text-xs text-gray-500">
          © {new Date().getFullYear()} Offer Alert. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;
