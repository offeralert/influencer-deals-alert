
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";
import ShareProfileButton from "@/components/ui/share-profile-button";
import SocialMediaIcons from "./SocialMediaIcons";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface InfluencerProfileHeaderProps {
  fullName: string;
  username: string;
  avatarUrl: string;
  isCreditCard?: boolean;
  influencerId?: string;
}

interface SocialMediaData {
  instagram_url?: string;
  tiktok_url?: string;
  x_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
}

const InfluencerProfileHeader = ({
  fullName,
  username,
  avatarUrl,
  isCreditCard = false,
  influencerId
}: InfluencerProfileHeaderProps) => {
  const displayAvatarUrl = getAvatarUrl(avatarUrl);
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData>({});

  useEffect(() => {
    if (influencerId) {
      fetchSocialMediaData();
    }
  }, [influencerId]);

  const fetchSocialMediaData = async () => {
    if (!influencerId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('instagram_url, tiktok_url, x_url, youtube_url, linkedin_url')
        .eq('id', influencerId)
        .single();
      
      if (error) {
        console.error("Error fetching social media data:", error);
        return;
      }
      
      setSocialMediaData(data || {});
    } catch (error) {
      console.error("Error in fetchSocialMediaData:", error);
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={displayAvatarUrl} alt={fullName} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt={fullName} />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <div>
                <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
                <div className="space-y-1">
                  {!isCreditCard && (
                    <p className="text-muted-foreground">@{username}</p>
                  )}
                  <SocialMediaIcons
                    instagramUrl={socialMediaData.instagram_url}
                    tiktokUrl={socialMediaData.tiktok_url}
                    xUrl={socialMediaData.x_url}
                    youtubeUrl={socialMediaData.youtube_url}
                    linkedinUrl={socialMediaData.linkedin_url}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:ml-auto">
                {influencerId && (
                  <ShareProfileButton
                    influencerId={influencerId}
                    influencerName={fullName}
                    username={username}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerProfileHeader;
