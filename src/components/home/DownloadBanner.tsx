
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const DownloadBanner = () => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          <p className="text-sm text-muted-foreground">
            Get the most out of Offer Alert — download our browser extension.
          </p>
          <Button size="sm" className="h-8 whitespace-nowrap ml-4" asChild>
            <a 
              href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-3 w-3" />
              Download Extension
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadBanner;
