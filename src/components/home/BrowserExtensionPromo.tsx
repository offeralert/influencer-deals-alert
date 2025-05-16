
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

const BrowserExtensionPromo = () => {
  return (
    <section className="py-4 md:py-8 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-sm md:text-lg text-muted-foreground">
            Get the most out of Offer Alert — download the browser extension to unlock real-time savings.
          </p>
          <Button size="sm" className="md:size-lg" asChild>
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
    </section>
  );
};

export default BrowserExtensionPromo;
