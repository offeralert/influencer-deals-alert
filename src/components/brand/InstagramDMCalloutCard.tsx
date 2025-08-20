import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface InstagramDMCalloutCardProps {
  brandName: string;
}

export const InstagramDMCalloutCard = ({ brandName }: InstagramDMCalloutCardProps) => {
  const handleTryDM = () => {
    window.open(
      "https://www.instagram.com/direct/t/17841467068012447",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-400">
      <CardContent className="p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 rounded-full p-3">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg mb-2">Shop on Instagram</h3>
          <p className="text-sm text-white/90">
            Send us @{brandName} posts on Instagram for instant promo codes
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-white/20 p-4 bg-white/10">
        <Button 
          onClick={handleTryDM}
          className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
        >
          Try DM Assistant
        </Button>
      </CardFooter>
    </Card>
  );
};