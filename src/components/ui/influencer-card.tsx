
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { getAvatarUrl, DEFAULT_AVATAR_URL } from '@/utils/avatarUtils';

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
  isCreditCard?: boolean;
}

const InfluencerCard = ({ id, name, username, imageUrl, category, isCreditCard = false }: InfluencerCardProps) => {
  const avatarUrl = getAvatarUrl(imageUrl);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <Link to={`/influencer/${username}`} className="block hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={avatarUrl} 
                alt={name}
                className="object-cover"
              />
              <AvatarFallback>
                <AvatarImage src={DEFAULT_AVATAR_URL} alt={name} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{name}</h3>
              {!isCreditCard && (
                <p className="text-xs text-muted-foreground truncate">@{username}</p>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default InfluencerCard;
