
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category: string;
  followers: number;
  isFollowing?: boolean;
}

export function InfluencerCard({
  id,
  name,
  username,
  imageUrl,
  category,
  followers,
  isFollowing = false,
}: InfluencerCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  
  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFollowing(!following);
    if (!following) {
      toast.success(`You are now following ${name}`, {
        description: "You'll see their deals in your feed."
      });
    } else {
      toast.info(`You've unfollowed ${name}`);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link to={`/influencer/${id}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative pb-[100%]">
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
            <Button
              variant={following ? "secondary" : "default"}
              size="sm"
              className={following ? "text-brand-pink" : ""}
              onClick={handleFollow}
            >
              {following ? (
                <>
                  <UserCheck className="mr-1 h-4 w-4" />
                  Following
                </>
              ) : (
                "Follow"
              )}
            </Button>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">{category}</span>
            <span className="font-medium">{formatFollowers(followers)} followers</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
