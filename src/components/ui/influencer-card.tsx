
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
    <Card className="overflow-hidden h-[88px]">
      <CardContent className="p-3 h-full">
        <div className="flex items-center gap-3 h-full">
          <div className="w-10 h-10 flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={avatarUrl} 
                alt={name}
                width={40}
                height={40}
                className="object-cover"
              />
              <AvatarFallback>
                <AvatarImage src={DEFAULT_AVATAR_URL} alt={name} />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/influencer/${username}`} className="hover:underline">
              <h3 className="font-semibold text-sm truncate mb-0.5 leading-tight">{name}</h3>
              {!isCreditCard && (
                <p className="text-xs text-gray-500 truncate leading-tight">@{username}</p>
              )}
              <p className="text-xs text-gray-400 truncate leading-tight">
                {isLoadingFollowerCount ? (
                  "Loading..."
                ) : (
                  `${formatFollowerCountCompact(followerCount)} followers`
                )}
              </p>
            </Link>
          </div>
          <div className="w-16 flex-shrink-0">
            <Button 
              onClick={handleFollowToggle} 
              variant={isFollowing ? "outline" : "default"} 
              size="sm"
              className="text-xs h-8 w-full"
              disabled={isProcessing}
            >
              {isProcessing ? '...' : isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerCard;
