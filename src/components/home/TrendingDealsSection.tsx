import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  category: string;
}

interface PromoCodeRecord {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  category: string;
  is_trending: boolean | null;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const TrendingDealsSection = () => {
  const [trendingDeals, setTrendingDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingDeals();
  }, []);

  const fetchTrendingDeals = async () => {
    try {
      setLoading(true);
      
      // First try to get trending promo codes
      const { data: trendingData, error: trendingError } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          expiration_date,
          affiliate_link,
          category,
          is_trending,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('is_trending', true)
        .order('created_at', { ascending: false });
      
      if (trendingError) {
        console.error("Error fetching trending deals:", trendingError);
        useSampleDeals();
        return;
      }
      
      // If no trending deals found, get the most recent ones
      if (!trendingData || trendingData.length === 0) {
        const { data: recentData, error: recentError } = await supabase
          .from('promo_codes')
          .select(`
            id,
            brand_name,
            promo_code,
            description,
            expiration_date,
            affiliate_link,
            category,
            is_trending,
            profiles:user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (recentError) {
          console.error("Error fetching recent deals:", recentError);
          useSampleDeals();
          return;
        }
        
        if (!recentData || recentData.length === 0) {
          useSampleDeals();
          return;
        }
        
        transformAndSetDeals(recentData as PromoCodeRecord[]);
      } else {
        transformAndSetDeals(trendingData as PromoCodeRecord[]);
      }
    } catch (error) {
      console.error("Error in fetchTrendingDeals:", error);
      useSampleDeals();
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetDeals = (data: PromoCodeRecord[]) => {
    // Filter out incomplete deals
    const validDeals = data.filter(deal => 
      deal.brand_name && 
      deal.promo_code && 
      deal.description &&
      deal.profiles?.full_name
    );
    
    if (validDeals.length === 0) {
      useSampleDeals();
      return;
    }
    
    // Limit to 4 deals maximum
    const selectedDeals = validDeals.slice(0, 4);
    
    // Transform to our Deal interface
    const formattedDeals = selectedDeals.map(deal => ({
      id: deal.id,
      title: deal.description,
      brandName: deal.brand_name,
      discount: deal.promo_code,
      promoCode: deal.promo_code,
      expiryDate: deal.expiration_date,
      affiliateLink: deal.affiliate_link || "#",
      influencerName: deal.profiles?.full_name || 'Unknown Influencer',
      influencerImage: deal.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      category: deal.category || 'Fashion'
    }));
    
    setTrendingDeals(formattedDeals);
  };

  const useSampleDeals = () => {
    setTrendingDeals([
      {
        id: "1",
        title: "Summer Collection 2025",
        brandName: "FashionNova",
        discount: "30% OFF",
        promoCode: "SUMMER30",
        expiryDate: "2025-08-31",
        affiliateLink: "https://example.com",
        influencerName: "Sophia Chen",
        influencerImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
        category: "Fashion"
      },
      {
        id: "2",
        title: "Premium Fitness Tracker",
        brandName: "FitGear",
        discount: "25% OFF",
        promoCode: "FIT25",
        expiryDate: "2025-07-15",
        affiliateLink: "https://example.com",
        influencerName: "Marcus Johnson",
        influencerImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
        category: "Fitness"
      },
      {
        id: "3",
        title: "Gourmet Cooking Set",
        brandName: "ChefChoice",
        discount: "20% OFF",
        promoCode: "CHEF20",
        expiryDate: "2025-09-10",
        affiliateLink: "https://example.com",
        influencerName: "Emma Wilson",
        influencerImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        category: "Food"
      },
      {
        id: "4",
        title: "Smart Home Bundle",
        brandName: "TechLife",
        discount: "15% OFF",
        promoCode: "SMART15",
        expiryDate: "2025-07-30",
        affiliateLink: "https://example.com",
        influencerName: "Alex Rivera",
        influencerImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        category: "Tech"
      },
    ]);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingDeals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingDealsSection;
