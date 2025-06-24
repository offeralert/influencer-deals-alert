
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
    <Card className="overflow-hidden h-[120px] md:h-[140px] hover:shadow-md transition-shadow">
      <CardContent className="p-4 h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
              <Avatar className="h-12 w-12 md:h-14 md:w-14">
                <AvatarImage 
                  src={avatarUrl} 
                  alt={name}
                  className="object-cover"
                />
                <AvatarFallback>
                  <AvatarImage src={DEFAULT_AVATAR_URL} alt={name} />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/influencer/${username}`} className="hover:underline">
                <h3 className="font-semibold text-sm md:text-base truncate mb-1 leading-tight">{name}</h3>
                {!isCreditCard && (
                  <p className="text-xs md:text-sm text-gray-500 truncate leading-tight mb-1">@{username}</p>
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
          </div>
          <div className="mt-3">
            <Button 
              onClick={handleFollowToggle} 
              variant={isFollowing ? "outline" : "default"} 
              size="sm"
              className="text-xs md:text-sm h-8 md:h-9 w-full"
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
