
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4 py-2 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-8 items-center">
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              Discover <span className="gradient-text">Exclusive Deals</span> From Your Favorite Influencers
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Connect with influencers you love and unlock special discounts, affiliate links, and promo codes that you won't find anywhere else.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <Button size="default" asChild>
                {user ? (
                  <Link to="/extension-download">
                    <Download className="mr-2 h-4 w-4" />
                    Download Extension
                  </Link>
                ) : (
                  <Link to="/signup">Create Account</Link>
                )}
              </Button>
              <Button size="default" variant="outline" asChild>
                <Link to="/explore">Explore Deals</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
              alt="Influencer marketing" 
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -top-4 -right-4 bg-white dark:bg-brand-dark p-3 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-xs">30% OFF</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-brand-dark p-3 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-xs">SUMMER30</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
