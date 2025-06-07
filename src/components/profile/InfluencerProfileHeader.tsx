
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";
import ShareProfileButton from "@/components/ui/share-profile-button";

interface InfluencerProfileHeaderProps {
  fullName: string;
  username: string;
  avatarUrl: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
  isCreditCard?: boolean;
  influencerId?: string;
}

const InfluencerProfileHeader = ({
  fullName,
  username,
  avatarUrl,
  isFollowing,
  onFollowToggle,
  isCreditCard = false,
  influencerId
}: InfluencerProfileHeaderProps) => {
  const displayAvatarUrl = getAvatarUrl(avatarUrl);

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={displayAvatarUrl} alt={fullName} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt={fullName} />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <div>
                <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
                {!isCreditCard && (
                  <p className="text-muted-foreground">@{username}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 md:ml-auto">
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className="min-w-[120px]"
                  onClick={onFollowToggle}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
                
                {influencerId && (
                  <ShareProfileButton
                    influencerId={influencerId}
                    influencerName={fullName}
                    username={username}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerProfileHeader;
