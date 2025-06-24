
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CallToActionSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-8 md:py-16 relative overflow-hidden bg-gradient-to-br from-brand-light to-white dark:from-brand-dark dark:to-gray-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 gradient-bg" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold">Ready to Start Saving?</h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 md:px-0">
            {user 
              ? "Download our browser extension to automatically apply the best promo codes when you shop online."
              : "Get instant access to verified promo codes with our free browser extension, or create an account to follow your favorite influencers and get exclusive deals."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button size="lg" className="h-10 md:h-12" asChild>
              {user ? (
                <a 
                  href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Download Extension
                </a>
              ) : (
                <Link to="/signup">Sign Up Now</Link>
              )}
            </Button>
            <Button size="lg" className="h-10 md:h-12" variant="outline" asChild>
              {user ? (
                <Link to="/signup?tab=influencer">
                  <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Apply as Influencer
                </Link>
              ) : (
                <a 
                  href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Download Extension
                </a>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
