
import { Deal } from "@/types/explore";
import { DealCard } from "@/components/ui/deal-card";
import { Compass } from "lucide-react";
import PromoCodeDebugPanel from "@/components/debug/PromoCodeDebugPanel";

interface DealsViewProps {
  deals: Deal[];
  sortOption: string;
  onRefresh?: () => void;
}

const DealsView = ({ deals, sortOption, onRefresh }: DealsViewProps) => {
  const handleRefresh = () => {
    console.log('[DEALS] Manual refresh triggered');
    if (onRefresh) {
      onRefresh();
    }
  };

  if (deals.length === 0) {
    return (
      <div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-gray-500">
            Check back later for exciting promotions and discounts
          </p>
        </div>
        
        {/* Debug panel - only show in development or when there should be deals */}
        <PromoCodeDebugPanel 
          displayedDealsCount={0} 
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  console.log(`[DEALS] Rendering ${deals.length} deals`);

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
                      influencerUsername={deal.influencerUsername}
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
              influencerUsername={deal.influencerUsername}
            />
          ))}
        </div>
      )}
      
      {/* Debug panel */}
      <PromoCodeDebugPanel 
        displayedDealsCount={deals.length} 
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default DealsView;
