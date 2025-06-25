
import { Button } from "@/components/ui/button";
import { Download, Monitor } from "lucide-react";

const AddToDesktopSection = () => {
  return (
    <section className="py-8 md:py-16 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-green rounded-full flex items-center justify-center">
              <Monitor className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Add to Desktop</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
            Add Offer Alert to your browser in seconds - it's completely free and will notify you if a deal is available.
          </p>
          <Button size="lg" className="h-10 md:h-12" asChild>
            <a 
              href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Download Browser Extension
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AddToDesktopSection;
