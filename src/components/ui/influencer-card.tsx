
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useInfluencerFollow } from '@/hooks/useInfluencerFollow';

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
}

const InfluencerCard = ({ id, name, username, imageUrl, category }: InfluencerCardProps) => {
  const { isFollowing, handleFollowToggle, isProcessing } = useInfluencerFollow(id, name);

  return (
    <Card className="overflow-hidden">
      <Link to={`/influencer/${id}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate mb-0.5">{name}</h3>
              <p className="text-xs text-gray-500 truncate">@{username}</p>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-2">
        <Button 
          onClick={handleFollowToggle} 
          variant={isFollowing ? "outline" : "default"} 
          size="sm"
          className="w-full text-xs h-8"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfluencerCard;
