
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFollowerCount } from '@/hooks/useFollowerCount';
import { UserRound } from 'lucide-react';
import { useInfluencerFollow } from '@/hooks/useInfluencerFollow';

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
  followers?: number;
}

const InfluencerCard = ({ id, name, username, imageUrl, category }: InfluencerCardProps) => {
  const followerCount = useFollowerCount(id);
  const { isFollowing, handleFollowToggle } = useInfluencerFollow(id, name);

  return (
    <Card className="overflow-hidden">
      <Link to={`/influencer/${id}`}>
        <CardContent className="p-6 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-gray-500 mb-2">@{username}</p>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <UserRound className="h-4 w-4 mr-1" />
            <span>{followerCount} followers</span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4">
        <Button 
          onClick={handleFollowToggle} 
          variant={isFollowing ? "outline" : "default"} 
          className="w-full"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfluencerCard;
