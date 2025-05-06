import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InfluencerProfileHeaderProps {
  fullName: string;
  username: string;
  avatarUrl: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
}

const InfluencerProfileHeader = ({
  fullName,
  username,
  avatarUrl,
  isFollowing,
  onFollowToggle
}: InfluencerProfileHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        {isMobile ? (
          // Mobile layout - similar to tile design
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback>{fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate mb-0.5">{fullName}</h1>
              <p className="text-sm text-muted-foreground truncate">@{username}</p>
            </div>
            <Button 
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={onFollowToggle}
              className="whitespace-nowrap ml-1"
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
          </div>
        ) : (
          // Desktop layout - keep existing layout with modifications
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback>{fullName[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
                  <p className="text-muted-foreground">@{username}</p>
                </div>
                
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className="min-w-[120px] md:ml-auto"
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
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfluencerProfileHeader;
