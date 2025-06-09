
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { useInfluencerData } from "@/hooks/useInfluencerData";
import { useInfluencerFollow } from "@/hooks/useInfluencerFollow";
import { useFollowerCount } from "@/hooks/useFollowerCount";
import InfluencerProfileHeader from "@/components/profile/InfluencerProfileHeader";
import InfluencerPromoCodes from "@/components/profile/InfluencerPromoCodes";
import NotFound from "./NotFound";

const InfluencerProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [promoCodes, setPromoCodes] = useState<PromoCodeWithInfluencer[]>([]);
  const { influencer, loading } = useInfluencerData(username);
  const { isFollowing, handleFollowToggle } = useInfluencerFollow(
    influencer?.id,
    influencer?.full_name || ""
  );
  const { followerCount, isLoading: isLoadingFollowerCount } = useFollowerCount(influencer?.id || "");

  useEffect(() => {
    if (influencer?.id) {
      fetchPromoCodes();
    }
  }, [influencer?.id]);

  const fetchPromoCodes = async () => {
    if (!influencer?.id) return;
    
    try {
      const { data, error } = await getPromoCodes()
        .eq('influencer_id', influencer.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading influencer profile...</p>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InfluencerProfileHeader
        fullName={influencer.full_name}
        username={influencer.username}
        avatarUrl={influencer.avatar_url}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        isCreditCard={influencer.is_creditcard}
        influencerId={influencer.id}
        followerCount={followerCount}
        isLoadingFollowerCount={isLoadingFollowerCount}
      />
      
      <InfluencerPromoCodes
        promoCodes={promoCodes}
        influencerId={influencer.id}
        influencerName={influencer.full_name}
        influencerImage={influencer.avatar_url}
        influencerUsername={influencer.username}
      />
    </div>
  );
};

export default InfluencerProfile;
