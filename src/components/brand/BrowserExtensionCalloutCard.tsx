import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Download } from "lucide-react";

interface BrowserExtensionCalloutCardProps {
  brandName: string;
}

export const BrowserExtensionCalloutCard = ({ brandName }: BrowserExtensionCalloutCardProps) => {
  const handleDownload = () => {
    window.open(
      "https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400">
      <CardContent className="p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 rounded-full p-3">
            <Download className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg mb-2">Never Miss a Deal</h3>
          <p className="text-sm text-white/90">
            Get instant notifications when new {brandName} codes are available
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-white/20 p-4 bg-white/10">
        <Button 
          onClick={handleDownload}
          className="w-full bg-white text-green-600 hover:bg-white/90 font-semibold"
        >
          Add to Chrome
        </Button>
      </CardFooter>
    </Card>
  );
};