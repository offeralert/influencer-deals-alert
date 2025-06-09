
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useInfluencerFollow } from '@/hooks/useInfluencerFollow';
import { useFollowerCount } from '@/hooks/useFollowerCount';
import { getAvatarUrl, DEFAULT_AVATAR_URL } from '@/utils/avatarUtils';
import { formatFollowerCountCompact } from '@/utils/followerUtils';

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
  isCreditCard?: boolean;
}

const InfluencerCard = ({ id, name, username, imageUrl, category, isCreditCard = false }: InfluencerCardProps) => {
  const { isFollowing, handleFollowToggle, isProcessing } = useInfluencerFollow(id, name);
  const { followerCount, isLoading: isLoadingFollowerCount } = useFollowerCount(id);
  const avatarUrl = getAvatarUrl(imageUrl);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt={name} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link to={`/influencer/${username}`} className="hover:underline">
              <h3 className="font-semibold text-sm truncate mb-0.5">{name}</h3>
              {!isCreditCard && (
                <p className="text-xs text-gray-500 truncate">@{username}</p>
              )}
              <p className="text-xs text-gray-400 truncate">
                {isLoadingFollowerCount ? (
                  "Loading..."
                ) : (
                  `${formatFollowerCountCompact(followerCount)} followers`
                )}
              </p>
            </Link>
          </div>
          <Button 
            onClick={handleFollowToggle} 
            variant={isFollowing ? "outline" : "default"} 
            size="sm"
            className="text-xs h-8 whitespace-nowrap ml-1"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerCard;
