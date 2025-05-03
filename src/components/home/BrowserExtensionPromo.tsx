
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

const BrowserExtensionPromo = () => {
  return (
    <section className="homepage-section py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold">Enhance Your Shopping Experience</h3>
          <p className="text-sm md:text-lg text-muted-foreground">
            Get the most out of Offer Alert — download the browser extension to unlock real-time savings.
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link to="/extension-download">
              <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Download Extension
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BrowserExtensionPromo;
