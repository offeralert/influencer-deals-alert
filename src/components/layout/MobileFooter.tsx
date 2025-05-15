
import { Link } from "react-router-dom";
import { UserPlus, Instagram, Mail } from "lucide-react";

const MobileFooter = () => {
  return (
    <div className="bg-white dark:bg-gray-900 px-4 py-8 mt-8 border-t">
      <div className="space-y-6">
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
            <h4 className="font-semibold mb-2 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400">
                  Contact
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
