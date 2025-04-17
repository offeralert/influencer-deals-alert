
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CallToActionSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-4 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 gradient-bg" />
      </div>
      <div className="container mx-auto px-2 md:px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-2 md:space-y-6">
          <h2 className="text-xl md:text-4xl font-bold">Ready to Start Saving?</h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2 md:px-0">
            {user 
              ? "Download our browser extension to automatically apply the best promo codes when you shop online."
              : "Create an account today to follow your favorite influencers and get access to exclusive deals and promo codes."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-4">
            <Button size="sm" className="md:size-lg" asChild>
              {user ? (
                <Link to="/extension-download">
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Download Extension
                </Link>
              ) : (
                <Link to="/signup">Sign Up Now</Link>
              )}
            </Button>
            <Button size="sm" className="md:size-lg" variant="outline" asChild>
              <Link to="/signup?tab=influencer">
                <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Apply as Influencer
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
