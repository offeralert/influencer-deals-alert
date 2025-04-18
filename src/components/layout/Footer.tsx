import { Instagram, Mail, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold gradient-text mb-4">Offer Alert</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect with your favorite influencers and discover exclusive deals and promo codes.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/offeralert.io/" className="text-gray-500 hover:text-brand-purple">
                <Instagram size={20} />
              </a>
              <a href="mailto:hello@offeralert.io" className="text-gray-500 hover:text-brand-purple">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Home</Link></li>
              <li><Link to="/explore" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Explore</Link></li>
              <li><Link to="/explore?tab=brands" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Brands</Link></li>
              <li><Link to="/categories" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Categories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Influencers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/signup?tab=influencer" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-purple flex items-center gap-2"
                >
                  <UserPlus size={16} /> Apply as Influencer
                </Link>
              </li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Pricing</Link></li>
              <li><Link to="/influencer-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Popular Brands</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <Link to="/brand/Nike" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">
                  Nike
                </Link>
                <Link 
                  to="/brand/Nike" 
                  className="text-xs text-brand-green hover:text-brand-green/80"
                >
                  View Offers
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <Link to="/brand/Adidas" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">
                  Adidas
                </Link>
                <Link 
                  to="/brand/Adidas" 
                  className="text-xs text-brand-green hover:text-brand-green/80"
                >
                  View Offers
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <Link to="/brand/Amazon" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">
                  Amazon
                </Link>
                <Link 
                  to="/brand/Amazon" 
                  className="text-xs text-brand-green hover:text-brand-green/80"
                >
                  View Offers
                </Link>
              </li>
              <li>
                <Link to="/explore?tab=brands" className="text-gray-600 dark:text-gray-400 hover:text-brand-purple">
                  View All Brands
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Offer Alert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
