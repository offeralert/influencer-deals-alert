
import { Deal } from "@/types/explore";
import { DealCard } from "@/components/ui/deal-card";
import { Compass } from "lucide-react";

interface DealsViewProps {
  deals: Deal[];
  sortOption: string;
  selectedCategories: string[];
}

const DealsView = ({ deals, sortOption, selectedCategories }: DealsViewProps) => {
  if (deals.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No deals found</h3>
        <p className="text-gray-500">
          {selectedCategories.length > 0 
            ? "Try adjusting your category filters"
            : "Check back later for exciting promotions and discounts!"}
        </p>
      </div>
    );
  }

  if (sortOption === "category") {
    return (
      <div className="mb-8">
        {Array.from(new Set(deals.map(deal => deal.category))).map(category => (
          <div key={category} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals
                .filter(deal => deal.category === category)
                .map(deal => (
                  <DealCard 
                    key={deal.id} 
                    {...deal} 
                    influencerId={deal.influencerId}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard 
          key={deal.id} 
          {...deal} 
          influencerId={deal.influencerId}
        />
      ))}
    </div>
  );
};

export default DealsView;
