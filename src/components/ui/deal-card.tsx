
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DealCardProps {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  discount: string;
  promoCode?: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
}

export function DealCard({
  id,
  title,
  brandName,
  imageUrl,
  discount,
  promoCode,
  expiryDate,
  affiliateLink = "#", // Default value for affiliateLink
  influencerName,
  influencerImage,
}: DealCardProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyPromoCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success("Promo code copied to clipboard!");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const openAffiliateLink = () => {
    window.open(affiliateLink, "_blank");
    toast.info("Opening brand website...");
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative pb-[100%]">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 dark:bg-black/70">
          {discount}
        </Badge>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={influencerImage}
            alt={influencerName}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground">{influencerName}</span>
        </div>
        
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{brandName}</p>
        
        {expiryDate && (
          <p className="text-xs text-muted-foreground mb-4">
            Expires: {new Date(expiryDate).toLocaleDateString()}
          </p>
        )}
        
        <div className="space-y-2">
          {promoCode && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted p-2 rounded text-sm font-mono">
                {promoCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyPromoCode}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
          )}
          
          <Button className="w-full" onClick={openAffiliateLink}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Shop Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
