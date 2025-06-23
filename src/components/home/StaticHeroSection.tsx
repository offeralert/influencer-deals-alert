
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

const StaticHeroSection = () => {
  return (
    <section className="py-6 md:py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              Shop. <span className="text-brand-green">Save.</span> Influencers Get Paid.
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Follow the influencers you love and get automatic alerts with their latest promo codes and affiliate links while you shop online. You save money and they keep 100% of the commission. <span className="text-brand-green font-medium">Win. Win.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="h-10 md:h-12" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-10 md:h-12" asChild>
                <Link to="/explore">Explore Deals</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src="/lovable-uploads/4163e391-453b-4996-94e7-1d82186d21b6.png" 
              alt="Online Shopping Experience" 
              width="600"
              height="400"
              className="rounded-lg shadow-xl object-cover h-auto w-full"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute -top-4 -right-4 bg-white dark:bg-brand-dark p-3 rounded-lg shadow-lg">
              <div className="gradient-bg p-2 rounded-md text-white font-medium text-sm">30% OFF</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-brand-dark p-3 rounded-lg shadow-lg">
              <div className="gradient-bg p-2 rounded-md text-white font-medium text-sm">SUMMER30</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaticHeroSection;
