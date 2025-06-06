
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatExpiryDate } from "@/utils/dateUtils";

interface DealCardProps {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerUsername: string;
  category: string;
}

export function DealCard({
  id,
  title,
  brandName,
  discount,
  promoCode,
  expiryDate,
  affiliateLink,
  influencerName,
  influencerImage,
  influencerUsername,
  category
}: DealCardProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    toast.success("Promo code copied to clipboard!");
  };

  const openAffiliate = () => {
    if (affiliateLink && affiliateLink !== "#") {
      window.open(affiliateLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/brand/${encodeURIComponent(brandName)}`} className="font-bold text-base hover:underline">
            {brandName}
          </Link>
          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
            {title}
          </Badge>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-2 mb-3 flex justify-between items-center">
          <div className="font-mono text-sm truncate pr-2" style={{ maxWidth: "calc(100% - 30px)" }}>
            {promoCode}
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopyCode} className="p-1 h-auto">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mb-0">
          <div className="flex-1">
            {expiryDate ? (
              <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
            ) : (
              <span>No expiration date</span>
            )}
          </div>
          <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {category}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-3 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <Link 
          to={`/influencer/${influencerUsername}`} 
          className="flex items-center gap-2 hover:underline"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={influencerImage} alt={influencerName} />
            <AvatarFallback>{influencerName[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{influencerName}</span>
        </Link>
        
        <Button 
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-3 py-0 flex items-center gap-1"
          onClick={openAffiliate}
          disabled={!affiliateLink || affiliateLink === "#"}
        >
          Shop <ExternalLink className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
