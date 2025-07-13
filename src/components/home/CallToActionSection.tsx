
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CallToActionSection = () => {
  const { user } = useAuth();

  // For non-logged-in users, show signup options for influencers and agencies
  if (!user) {
    return (
      <section className="py-8 md:py-16 relative overflow-hidden bg-gradient-to-br from-brand-light to-white dark:from-brand-dark dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 gradient-bg" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold">Join Offer Alert</h2>
            <p className="text-base md:text-lg font-medium text-brand-green">
              Sign up as an influencer to share deals or as an agency to manage multiple influencers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button size="lg" className="h-10 md:h-12" asChild>
                <Link to="/signup">
                  <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Sign Up as Influencer
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-10 md:h-12" asChild>
                <Link to="/signup?tab=agency">
                  <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Sign Up as Agency
                </Link>
              </Button>
            </div>
            <div className="pt-4">
              <Button size="lg" variant="ghost" className="h-10 md:h-12" asChild>
                <a 
                  href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Download Extension
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // For logged-in users, show the browser extension download
  return (
    <section className="py-8 md:py-16 relative overflow-hidden bg-gradient-to-br from-brand-light to-white dark:from-brand-dark dark:to-gray-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 gradient-bg" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold">Ready to Start Saving?</h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 md:px-0">
            Download our browser extension to automatically apply the best promo codes when you shop online.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="h-10 md:h-12" asChild>
              <a 
                href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Download Extension
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
