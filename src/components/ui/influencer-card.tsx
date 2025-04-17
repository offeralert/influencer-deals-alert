
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
  const { isFollowing, handleFollowToggle } = useInfluencerFollow(id, name);

  return (
    <Card className="overflow-hidden">
      <Link to={`/influencer/${id}`}>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4">
            <Avatar className="h-12 w-12 md:h-24 md:w-24 md:mb-4">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 md:text-center">
              <h3 className="font-semibold text-base md:text-lg mb-0 md:mb-1">{name}</h3>
              <p className="text-xs md:text-sm text-gray-500">@{username}</p>
              {category && (
                <div className="hidden md:block text-sm text-gray-600 mt-2">
                  <span>{category}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-2 md:p-4">
        <Button 
          onClick={handleFollowToggle} 
          variant={isFollowing ? "outline" : "default"} 
          size="sm"
          className="w-full text-xs md:text-sm"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfluencerCard;
