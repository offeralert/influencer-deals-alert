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
  influencerId: string; // This is required
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
  influencerId, // Make sure we're using this
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
      <CardContent className="p-3 md:p-4 flex-grow flex flex-col justify-between pt-4 md:pt-6">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-base md:text-lg">{brandName}</h3>
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/30">
              {category}
            </Badge>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">{title}</p>
          
          <div className="bg-muted rounded-md p-1.5 md:p-2 flex justify-between items-center mb-2 md:mb-3">
            <code className="text-xs md:text-sm font-mono">{promoCode}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 md:h-8 md:w-8 p-0"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : <Copy className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
          </div>
          
          <div className="mb-2 md:mb-3 text-xs text-muted-foreground">
            Expires: {formatDate(expiryDate)}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <Link to={`/influencer/${influencerId}`} className="flex items-center gap-1.5 md:gap-2 hover:underline">
            <Avatar className="h-6 w-6 md:h-7 md:w-7">
              <AvatarImage src={influencerImage} alt={influencerName} />
              <AvatarFallback>{influencerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs md:text-sm">{influencerName}</span>
          </Link>
          
          {affiliateLink && (
            <Button variant="outline" size="sm" className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm" asChild>
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
