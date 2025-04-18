
import { Influencer } from "@/types/explore";
import InfluencerCard from "@/components/ui/influencer-card";
import { Compass } from "lucide-react";

interface InfluencersViewProps {
  influencers: Influencer[];
}

const InfluencersView = ({ influencers }: InfluencersViewProps) => {
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
  );
};

export default InfluencersView;
