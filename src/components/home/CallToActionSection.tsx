
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, UserPlus, Instagram } from "lucide-react";

const CallToActionSection = () => {
  return (
    <section className="py-8 md:py-16 relative overflow-hidden bg-gradient-to-br from-brand-light to-white dark:from-brand-dark dark:to-gray-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 gradient-bg" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Shoppers Section */}
            <div className="text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Saving?</h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Join thousands of users who are already saving money with discount codes.
              </p>
              <p className="text-lg font-semibold text-brand-green">
                Try it now: DM us <span className="bg-brand-green/10 px-2 py-1 rounded">@offeralert.io</span> on Instagram
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="h-10 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
                  <a 
                    href="https://www.instagram.com/offeralert.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Instagram className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Try Instagram DM
                  </a>
                </Button>
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

            {/* Influencers Section */}
            <div className="text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Are You an Influencer?</h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Get your promo codes discovered by thousands of shoppers. Join our platform and increase your reach.
              </p>
              <div className="bg-brand-green/10 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-brand-green">
                  ✨ Share your codes with our community and help people save money while growing your influence
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="h-10 md:h-12" asChild>
                  <Link to="/signup">
                    <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Sign Up as Influencer
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-10 md:h-12" asChild>
                  <Link to="/influencer-apply">
                    Apply Now
                  </Link>
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
