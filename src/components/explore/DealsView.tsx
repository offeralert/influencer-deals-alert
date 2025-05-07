
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
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No deals found</h3>
        <p className="text-gray-500">
          {selectedCategories.length > 0 
            ? "Try adjusting your category filters"
            : "Check back later for exciting promotions and discounts"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-3">
        {deals.length} deal{deals.length !== 1 ? 's' : ''} found
      </div>

      {sortOption === "category" ? (
        <div className="mb-6">
          {Array.from(new Set(deals.map(deal => deal.category))).map(category => (
            <div key={category} className="mb-5">
              <h2 className="text-xl font-semibold mb-3">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              {...deal} 
              influencerId={deal.influencerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsView;
