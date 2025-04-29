import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const HeroSection = () => {
  const {
    user
  } = useAuth();
  return <section className="relative bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4 py-2 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-center">
          <div className="space-y-2 md:space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Discover <span className="gradient-text">Exclusive Deals</span> From Your Favorite Influencers
            </h1>
            <p className="text-sm text-muted-foreground">Follow influencers you love and unlock special discounts, affiliate links, and promo codes that you won't find anywhere else.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" className="h-8" asChild>
                {user ? <Link to="/extension-download">
                    <Download className="mr-2 h-3 w-3" />
                    Download Extension
                  </Link> : <Link to="/signup">Create Account</Link>}
              </Button>
              <Button size="sm" variant="outline" className="h-8" asChild>
                <Link to="/explore">Explore Deals</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative max-h-[200px]">
            <img src="/lovable-uploads/6250f286-c8e5-4885-894a-d2619dcafeb6.png" alt="Online Shopping and Deals" className="rounded-lg shadow-2xl object-cover h-[200px] w-full" />
            <div className="absolute -top-2 -right-2 bg-white dark:bg-brand-dark p-2 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-xs">30% OFF</div>
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white dark:bg-brand-dark p-2 rounded-lg shadow-lg">
              <div className="gradient-bg p-1 rounded-md text-white font-medium text-xs">SUMMER30</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;