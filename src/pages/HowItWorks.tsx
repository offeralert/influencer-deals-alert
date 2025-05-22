
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Download, Users } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        How <span className="gradient-text">Offer Alert</span> Works
      </h1>

      <div className="space-y-16">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-brand-light dark:bg-brand-dark rounded-full p-6 flex items-center justify-center">
            <span className="text-4xl font-bold gradient-text">1</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              It's free and takes just seconds. Sign up with your email or use your social accounts.
            </p>
            <Link to="/signup">
              <Button className="mt-2">
                Sign up now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-brand-light dark:bg-brand-dark rounded-full p-6 flex items-center justify-center md:order-first">
            <span className="text-4xl font-bold gradient-text">2</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Follow your favorite influencers</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Doing so unlocks access to their promo codes and affiliate offers. The more influencers you follow, the more deals you'll discover.
            </p>
            <Link to="/explore?tab=influencers">
              <Button variant="outline" className="mt-2">
                <Users className="mr-2 h-4 w-4" /> Explore influencers
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-brand-light dark:bg-brand-dark rounded-full p-6 flex items-center justify-center">
            <span className="text-4xl font-bold gradient-text">3</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Download and sign in to the browser extension</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              This enables in-browser notifications when offers are available. Never miss a deal again while shopping online.
            </p>
            <a 
              href="https://chromewebstore.google.com/detail/offer-alert/bpbafccmoldgaecdefhjfmmandfgblfk" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="mt-2">
                <Download className="mr-2 h-4 w-4" /> Get the extension
              </Button>
            </a>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-brand-light dark:bg-brand-dark rounded-full p-6 flex items-center justify-center md:order-first">
            <span className="text-4xl font-bold gradient-text">4</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">Shop as usual</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              When you're on a supported site, the extension pops up with any relevant codes tied to influencers you follow. Simply click to apply the best offers.
            </p>
          </div>
        </div>
      </div>

      {/* Why We're Different Section */}
      <div className="mt-20 py-12 px-8 bg-brand-paleGreen dark:bg-brand-dark rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Why We're Different</h2>
        
        <div className="flex items-start gap-4 max-w-2xl mx-auto">
          <div className="mt-1 bg-brand-green rounded-full p-1 flex-shrink-0">
            <Check className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg">
            <strong>Influencers keep 100% of the commission</strong> when you shop through their links. 
            We don't take a cut — you save, and they earn.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to start saving?</h3>
        <Link to="/signup">
          <Button size="lg" className="mt-2">
            Get started now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
