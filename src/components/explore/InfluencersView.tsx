
import { useState, useEffect } from "react";
import { Influencer } from "@/types/explore";
import InfluencerCard from "@/components/ui/influencer-card";
import { Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfluencerBulkFollow } from "@/hooks/useInfluencerBulkFollow";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface InfluencersViewProps {
  influencers: Influencer[];
}

const InfluencersView = ({ influencers }: InfluencersViewProps) => {
  const { user } = useAuth();
  const { followAllInfluencers, isProcessing } = useInfluencerBulkFollow();
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

  const handleFollowAll = async () => {
    const result = await followAllInfluencers(influencers);
    if (result.success) {
      // Refresh follow status after bulk follow
      const influencerIds = influencers.map(inf => inf.id);
      try {
        const { data, error } = await supabase
          .from('user_domain_map')
          .select('influencer_id')
          .eq('user_id', user?.id)
          .in('influencer_id', influencerIds);

        if (!error && data) {
          setFollowedInfluencers(data.map(item => item.influencer_id));
        }
      } catch (error) {
        console.error("Error refreshing follow status:", error);
      }
    }
  };

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

  const unfollowedCount = user ? influencers.filter(inf => !followedInfluencers.includes(inf.id)).length : influencers.length;
  const allFollowed = user && unfollowedCount === 0;

  return (
    <div className="space-y-6">
      {/* Follow All Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {influencers.length} influencer{influencers.length === 1 ? '' : 's'} found
        </div>
        
        {influencers.length > 0 && (
          <Button
            onClick={handleFollowAll}
            disabled={isProcessing || loadingFollowStatus || allFollowed}
            variant={allFollowed ? "outline" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isProcessing ? (
              "Processing..."
            ) : allFollowed ? (
              "Following All"
            ) : (
              `Follow All${unfollowedCount > 0 ? ` (${unfollowedCount})` : ''}`
            )}
          </Button>
        )}
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
