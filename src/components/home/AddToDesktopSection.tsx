
import { Button } from "@/components/ui/button";
import { Download, Instagram } from "lucide-react";

const AddToDesktopSection = () => {
  return (
    <section className="py-8 md:py-16 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start with Instagram DM</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
            The easiest way to get discount codes - just send us a DM at <span className="font-semibold text-purple-600">@offeralert.io</span> while you're already browsing Instagram.
          </p>
          
          {/* Example DM interaction */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 md:p-6 mb-6 md:mb-8 max-w-2xl mx-auto">
            <div className="text-sm md:text-base">
              <div className="mb-4">
                <div className="font-medium text-gray-800 mb-1">You → @offeralert.io</div>
                <div className="bg-blue-100 text-blue-800 p-3 rounded-lg inline-block">@rarebeauty</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-800 mb-1">@offeralert.io → You</div>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  🎉 Found 1 promo code for Rare Beauty (@rarebeauty):<br/><br/>
                  <strong>Code:</strong> SASCHA15<br/>
                  <strong>Amount:</strong> 15% off<br/>
                  <strong>Link:</strong> https://www.rarebeauty.com<br/>
                  <strong>From:</strong> @sascha.skincare
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Button size="lg" variant="outline" className="h-10 md:h-12" asChild>
              <a 
                href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Or Get Extension
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddToDesktopSection;
