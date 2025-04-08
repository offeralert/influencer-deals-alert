import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SavedDeal {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  category: string;
}

const MyDeals = () => {
  const { user } = useAuth();
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedDeals();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSavedDeals = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would fetch the user's saved deals from the database
      // For now, we'll use placeholder data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data
      const mockDeals: SavedDeal[] = [
        {
          id: "1",
          title: "20% off all shoes",
          brandName: "Nike",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          discount: "20% OFF",
          promoCode: "NIKE20",
          expiryDate: "2023-12-31",
          affiliateLink: "https://nike.com",
          influencerName: "John Runner",
          influencerImage: "https://randomuser.me/api/portraits/men/32.jpg",
          category: "Fashion"
        },
        {
          id: "2",
          title: "Buy one get one free",
          brandName: "Starbucks",
          imageUrl: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e",
          discount: "BOGO",
          promoCode: "COFFEEDAY",
          expiryDate: "2023-11-15",
          affiliateLink: "https://starbucks.com",
          influencerName: "Coffee Lover",
          influencerImage: "https://randomuser.me/api/portraits/women/44.jpg",
          category: "Food"
        },
        {
          id: "3",
          title: "15% off your first order",
          brandName: "Amazon",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          discount: "15% OFF",
          promoCode: "WELCOME15",
          affiliateLink: "https://amazon.com",
          influencerName: "Tech Deals",
          influencerImage: "https://randomuser.me/api/portraits/men/62.jpg",
          category: "Tech"
        }
      ];
      
      setSavedDeals(mockDeals);
    } catch (error) {
      console.error("Error fetching saved deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Saved Deals</h1>
      
      {isLoading ? (
        <div className="text-center py-16">
          <p>Loading your saved deals...</p>
        </div>
      ) : savedDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedDeals.map((deal) => (
            <DealCard
              key={deal.id}
              id={deal.id}
              title={deal.title}
              brandName={deal.brandName}
              imageUrl={deal.imageUrl}
              discount={deal.discount}
              promoCode={deal.promoCode}
              expiryDate={deal.expiryDate}
              affiliateLink={deal.affiliateLink}
              influencerName={deal.influencerName}
              influencerImage={deal.influencerImage}
              category={deal.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">You haven't saved any deals yet</h3>
          <p className="text-gray-500 mb-4">
            Start exploring and save deals you're interested in.
          </p>
          <Button asChild>
            <Link to="/explore">Explore Deals</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyDeals;
