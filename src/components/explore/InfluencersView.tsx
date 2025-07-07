
import { useState, useEffect } from "react";
import { Influencer } from "@/types/explore";
import InfluencerCard from "@/components/ui/influencer-card";
import { Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface InfluencersViewProps {
  influencers: Influencer[];
}

const InfluencersView = ({ influencers }: InfluencersViewProps) => {
  const { user } = useAuth();
  const [followedInfluencers, setFollowedInfluencers] = useState<string[]>([]);
  const [loadingFollowStatus, setLoadingFollowStatus] = useState(false);

  // Check which influencers are already being followed
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || influencers.length === 0) {
        setFollowedInfluencers([]);
        return;
      }

      setLoadingFollowStatus(true);
      try {
        const influencerIds = influencers.map(inf => inf.id);
        const { data, error } = await supabase
          .from('user_domain_map')
          .select('influencer_id')
          .eq('user_id', user.id)
          .in('influencer_id', influencerIds);

        if (!error && data) {
          setFollowedInfluencers(data.map(item => item.influencer_id));
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoadingFollowStatus(false);
      }
    };

    checkFollowStatus();
  }, [user, influencers]);

  if (influencers.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No influencers found</h3>
        <p className="text-gray-500">
          Check back later for exciting influencers to follow!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Influencers count */}
      <div className="text-sm text-gray-600">
        {influencers.length} influencer{influencers.length === 1 ? '' : 's'} found
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {influencers.map((influencer) => (
          <InfluencerCard
            key={influencer.id}
            id={influencer.id}
            name={influencer.full_name}
            username={influencer.username}
            imageUrl={influencer.avatar_url}
            category={influencer.category}
          />
        ))}
      </div>
    </div>
  );
};

export default InfluencersView;
