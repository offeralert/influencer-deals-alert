
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover <span className="gradient-text">Exclusive Deals</span> From Your Favorite Influencers
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect with influencers you love and unlock special discounts, affiliate links, and promo codes that you won't find anywhere else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                {user ? (
                  <Link to="/extension-download">
                    <Download className="mr-2 h-5 w-5" />
                    Download Extension
                  </Link>
                ) : (
                  <Link to="/signup">Create Account</Link>
                )}
              </Button>
              <Button size="lg" variant="outline" asChild>
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
            <div className="absolute -top-6 -right-6 bg-white dark:bg-brand-dark p-4 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-sm">30% OFF</div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-brand-dark p-4 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-sm">SUMMER30</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
