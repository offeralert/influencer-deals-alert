
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Edit, Eye, EyeOff, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";
import { useState } from "react";
import { toast } from "sonner";

interface InfluencerCardProps {
  relationship: {
    id: string;
    temporary_password?: string;
    influencer_profile: {
      id: string;
      full_name?: string;
      username?: string;
      avatar_url?: string;
      is_influencer?: boolean;
    };
  };
  promoCount: number;
  onEdit: (influencer: any, relationshipId: string) => void;
}

const InfluencerCard = ({ relationship, promoCount, onEdit }: InfluencerCardProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const influencer = relationship.influencer_profile;
  const avatarUrl = getAvatarUrl(influencer?.avatar_url);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEditClick = () => {
    onEdit(influencer, relationship.id);
  };

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} alt={influencer?.full_name || ''} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {influencer?.full_name || influencer?.username || 'Unknown'}
            </h3>
            {influencer?.username && (
              <p className="text-sm text-muted-foreground">
                @{influencer.username}
              </p>
            )}
            
            {relationship.temporary_password && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Temp Password:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(relationship.temporary_password!, 'Password')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <code className="text-xs font-mono">
                  {isPasswordVisible ? relationship.temporary_password : '••••••••••'}
                </code>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {promoCount} promo code{promoCount !== 1 ? 's' : ''}
              </Badge>
              {influencer?.is_influencer && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/manage-influencer-codes/${influencer?.id}`}>
                  <Plus className="h-3 w-3 mr-1" />
                  Manage Codes
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleEditClick}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerCard;
