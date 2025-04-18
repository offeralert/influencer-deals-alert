
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  category,
}: DealCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success(`${promoCode} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code to clipboard");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No expiration";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short", 
        day: "numeric", 
        year: "numeric"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-2 md:p-3 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex flex-col">
              <Link to={`/brand/${encodeURIComponent(brandName)}`} className="hover:underline">
                <h3 className="font-medium text-sm md:text-base">{brandName}</h3>
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{title}</p>
            </div>
            <Badge className="bg-brand-green text-white font-medium text-[10px] md:text-xs whitespace-nowrap">
              {discount}
            </Badge>
          </div>
          
          <div className="bg-muted rounded-md p-1 md:p-1.5 flex justify-between items-center mb-1.5 mt-2">
            <code className="text-xs font-mono">{promoCode}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 md:h-7 md:w-7 p-0"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="flex justify-between items-center text-[10px] md:text-xs text-muted-foreground mt-1.5">
            <span>Expires: {formatDate(expiryDate)}</span>
            <Badge variant="outline" className="text-[10px] md:text-xs font-normal text-muted-foreground bg-muted/30">
              {category}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 pt-1.5 border-t">
          <Link to={`/influencer/${influencerId}`} className="flex items-center gap-1.5 hover:underline">
            <Avatar className="h-5 w-5 md:h-6 md:w-6">
              <AvatarImage src={influencerImage} alt={influencerName} />
              <AvatarFallback>{influencerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{influencerName}</span>
          </Link>
          
          {affiliateLink && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" asChild>
              <a href={affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Shop <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
