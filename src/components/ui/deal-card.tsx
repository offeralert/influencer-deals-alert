
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export interface DealCardProps {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
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
  category,
}: DealCardProps) {
  const formatExpiryDate = (date?: string) => {
    if (!date) return "No expiration";
    
    const expiryDate = new Date(date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{brandName}</h3>
          <Badge variant="outline" className="bg-primary/10 border-none text-primary">
            {discount}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{title}</p>
        
        <div className="bg-muted p-2 rounded mb-3 flex justify-between items-center">
          <span className="font-medium">{promoCode}</span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatExpiryDate(expiryDate)}</span>
          </div>
          
          <Button size="sm" variant="outline" asChild>
            <a href={affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
              Shop <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <Link to={`/explore?category=${category}`} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
            {category}
          </Link>
          
          <Link to={`/influencer/${id.split('-')[0]}`} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={influencerImage} alt={influencerName} />
              <AvatarFallback>{influencerName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{influencerName}</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
