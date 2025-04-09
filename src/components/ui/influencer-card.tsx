
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category: string;
  followers: number;
}

const InfluencerCard = ({
  id,
  name,
  username,
  imageUrl,
  category,
  followers,
}: InfluencerCardProps) => {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  };

  return (
    <Link to={`/influencer/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground mb-1">@{username}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                <span>{formatFollowers(followers)} followers</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full inline-block">
              {category}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
