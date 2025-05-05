
import { Influencer } from "@/types/explore";
import InfluencerCard from "@/components/ui/influencer-card";
import { CreditCard } from "lucide-react";

interface CreditCardsViewProps {
  creditCards: Influencer[];
}

const CreditCardsView = ({ creditCards }: CreditCardsViewProps) => {
  if (creditCards.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No credit cards found</h3>
        <p className="text-gray-500">
          Check back later for exciting credit card offers!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {creditCards.map((card) => (
        <InfluencerCard
          key={card.id}
          id={card.id}
          name={card.full_name}
          username={card.username}
          imageUrl={card.avatar_url}
          category={card.category}
        />
      ))}
    </div>
  );
};

export default CreditCardsView;
