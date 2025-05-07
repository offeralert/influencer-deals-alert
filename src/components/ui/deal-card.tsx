
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { isExpired, isExpiringSoon, formatExpiryDate } from "@/utils/dateUtils";

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
  influencerId: string;
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
  influencerId,
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

  const expired = isExpired(expiryDate);
  const expiringSoon = isExpiringSoon(expiryDate);

  return (
    <Card className={`overflow-hidden ${expired ? 'opacity-70' : ''}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/brand/${encodeURIComponent(brandName)}`} className="font-medium hover:underline">
            {brandName}
          </Link>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50">
            {discount}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{title}</p>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2 mb-2 flex justify-between items-center">
          <div className="overflow-hidden">
            <div className="text-xs text-muted-foreground mb-0.5">Code:</div>
            <div className="font-mono font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis pr-2" style={{ maxWidth: "85%" }}>
              {promoCode}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopyCode} className="ml-auto">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        {expiryDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>
              Expires on: {new Date(expiryDate).toLocaleDateString()}
              {expired && (
                <Badge variant="destructive" className="text-[10px] ml-1">
                  Expired
                </Badge>
              )}
              {!expired && expiringSoon && (
                <Badge variant="outline" className="text-[10px] ml-1 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                  Soon
                </Badge>
              )}
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-2 bg-muted/20 flex justify-between items-center">
        <Link 
          to={`/influencer/${influencerId}`} 
          className="flex items-center gap-2 hover:underline flex-shrink"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={influencerImage} alt={influencerName} />
            <AvatarFallback>{influencerName[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{influencerName}</span>
        </Link>
        
        <Button 
          size="sm"
          className="h-7 text-xs px-2 py-0"
          onClick={openAffiliate}
          disabled={expired || !affiliateLink || affiliateLink === "#"}
        >
          {expired ? "Expired" : "Shop Now"} <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
