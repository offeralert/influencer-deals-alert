
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const StaticOnlyHeroSection = () => {
  return (
    <section className="py-6 md:py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              Shop. <span className="text-brand-green">Save.</span> Influencers Get Paid.
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Just send us a DM <span className="font-semibold text-brand-green">@offeralert.io</span> and get instant discount codes while shopping on Instagram. No app download required.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button size="lg" className="h-10 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
                <a 
                  href="https://www.instagram.com/offeralert.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Try Instagram DM
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="aspect-[3/2] w-full">
              <img 
                src="/lovable-uploads/3c14008e-37a3-4193-b523-8a681aa82718.png" 
                alt="Search Interface with Green Logo" 
                width="600"
                height="400"
                className="rounded-lg shadow-xl object-cover w-full h-full"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaticOnlyHeroSection;
