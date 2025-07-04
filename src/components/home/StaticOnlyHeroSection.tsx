
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
              Follow your favorite influencers and get notified of their promo codes when you shop online.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-1 text-sm text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2">Rated 5 stars on Chrome Store</span>
            </div>
            <div className="flex justify-center lg:justify-start">
              <Button size="lg" className="h-10 md:h-12" asChild>
                <a 
                  href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download Extension
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src="/lovable-uploads/3c14008e-37a3-4193-b523-8a681aa82718.png" 
              alt="Search Interface with Green Logo" 
              width="600"
              height="400"
              className="rounded-lg shadow-xl object-cover h-auto w-full"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaticOnlyHeroSection;
