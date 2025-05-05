
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { useInfluencerData } from "@/hooks/useInfluencerData";
import { useInfluencerFollow } from "@/hooks/useInfluencerFollow";
import InfluencerProfileHeader from "@/components/profile/InfluencerProfileHeader";
import InfluencerPromoCodes from "@/components/profile/InfluencerPromoCodes";

const InfluencerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [promoCodes, setPromoCodes] = useState<PromoCodeWithInfluencer[]>([]);
  const { influencer, loading } = useInfluencerData(id);
  const { isFollowing, handleFollowToggle } = useInfluencerFollow(
    id,
    influencer?.full_name || ""
  );

  useEffect(() => {
    if (id) {
      fetchPromoCodes();
    }
  }, [id]);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await getPromoCodes()
        .eq('influencer_id', id)
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Influencer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InfluencerProfileHeader
        fullName={influencer.full_name}
        username={influencer.username}
        avatarUrl={influencer.avatar_url}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
      />
      
      <InfluencerPromoCodes
        promoCodes={promoCodes}
        influencerId={influencer.id}
        influencerName={influencer.full_name}
        influencerImage={influencer.avatar_url}
      />
    </div>
  );
};

export default InfluencerProfile;
