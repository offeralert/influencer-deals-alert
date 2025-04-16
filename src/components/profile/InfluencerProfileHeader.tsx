
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";

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
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{fullName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
            <p className="text-muted-foreground mb-3">@{username}</p>
            
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerProfileHeader;
