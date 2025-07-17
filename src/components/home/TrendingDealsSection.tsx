import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { useGlobalPromoCodes } from "@/hooks/useGlobalPromoCodes";
import { isExpired } from "@/utils/dateUtils";

interface Deal {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerUsername: string;
  category: string;
}

const TrendingDealsSection = () => {
  const { promoCodes, loading } = useGlobalPromoCodes();

  const trendingDeals: Deal[] = useMemo(() => {
    // Filter valid promo codes
    const validPromoCodes = promoCodes.filter(pc => {
      const hasRequiredFields = pc.id && pc.brand_name && pc.promo_code && pc.profiles?.username;
      const notExpired = !pc.expiration_date || !isExpired(pc.expiration_date);
      return hasRequiredFields && notExpired;
    });

    // First try to get trending promo codes
    let trending = validPromoCodes.filter(pc => pc.is_trending === true);
    
    // If no trending deals, get the most recent ones
    if (trending.length === 0) {
      trending = validPromoCodes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);
    } else {
      trending = trending.slice(0, 4);
    }

    // Transform to Deal interface
    return trending.map(deal => ({
      id: deal.id || "",
      title: deal.description || "",
      brandName: deal.brand_name || "",
      discount: deal.promo_code || "",
      promoCode: deal.promo_code || "",
      expiryDate: deal.expiration_date,
      affiliateLink: deal.affiliate_link || "#",
      influencerName: deal.profiles?.full_name || 'Unknown Influencer',
      influencerImage: getAvatarUrl(deal.profiles?.avatar_url) || "",
      influencerUsername: deal.profiles?.username || 'unknown',
      category: deal.category || 'Fashion'
    }));
  }, [promoCodes]);

  // Sample deals as fallback
  const sampleDeals: Deal[] = [
    {
      id: "1",
      title: "30% OFF",
      brandName: "FashionNova",
      discount: "SUMMER30",
      promoCode: "SUMMER30",
      expiryDate: "2025-08-31",
      affiliateLink: "https://example.com",
      influencerName: "Sophia Chen",
      influencerImage: getAvatarUrl(null) || "",
      influencerUsername: "sophiachen",
      category: "Fashion"
    },
    {
      id: "2",
      title: "25% OFF",
      brandName: "FitGear",
      discount: "FIT25",
      promoCode: "FIT25",
      expiryDate: "2025-07-15",
      affiliateLink: "https://example.com",
      influencerName: "Marcus Johnson",
      influencerImage: getAvatarUrl(null) || "",
      influencerUsername: "marcusjohnson",
      category: "Fitness"
    },
    {
      id: "3",
      title: "20% OFF",
      brandName: "ChefChoice",
      discount: "CHEF20",
      promoCode: "CHEF20",
      expiryDate: "2025-09-10",
      affiliateLink: "https://example.com",
      influencerName: "Emma Wilson",
      influencerImage: getAvatarUrl(null) || "",
      influencerUsername: "emmawilson",
      category: "Food"
    },
    {
      id: "4",
      title: "15% OFF",
      brandName: "TechLife",
      discount: "SMART15",
      promoCode: "SMART15",
      expiryDate: "2025-07-30",
      affiliateLink: "https://example.com",
      influencerName: "Alex Rivera",
      influencerImage: getAvatarUrl(null) || "",
      influencerUsername: "alexrivera",
      category: "Tech"
    },
  ];

  const displayDeals = trendingDeals.length > 0 ? trendingDeals : sampleDeals;

  return (
    <section className="py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Trending Deals</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading deals...</p>
            </div>
          ) : (
            displayDeals.map((deal) => (
              <DealCard key={deal.id} {...deal} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingDealsSection;