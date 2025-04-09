
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
  imageUrl: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  category: string;
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
      
      const { data: influencerProfiles, error: influencerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_influencer', true);
      
      if (influencerError) {
        console.error("Error fetching influencer profiles:", influencerError);
        useSampleDeals();
        return;
      }
      
      const influencerIds = influencerProfiles.map(profile => profile.id);
      
      if (influencerIds.length === 0) {
        useSampleDeals();
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          expiration_date,
          affiliate_link,
          category,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .in('user_id', influencerIds)
        .or(`expiration_date.gt.${today},expiration_date.is.null`)
        .limit(8);
      
      if (error) {
        console.error("Error fetching trending deals:", error);
        useSampleDeals();
        return;
      }
      
      const validDeals = data.filter(deal => 
        deal.brand_name && 
        deal.promo_code && 
        deal.profiles?.full_name
      );
      
      if (validDeals.length === 0) {
        useSampleDeals();
        return;
      }
      
      const shuffledDeals = validDeals.sort(() => 0.5 - Math.random());
      const selectedDeals = shuffledDeals.slice(0, 4);
      
      const formattedDeals = selectedDeals.map(deal => ({
        id: deal.id,
        title: deal.description,
        brandName: deal.brand_name,
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
        discount: deal.promo_code,
        promoCode: deal.promo_code,
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link || "#",
        influencerName: deal.profiles?.full_name || 'Unknown Influencer',
        influencerImage: deal.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        category: deal.category || 'Fashion'
      }));
      
      setTrendingDeals(formattedDeals);
    } catch (error) {
      console.error("Error in fetchTrendingDeals:", error);
      useSampleDeals();
    } finally {
      setLoading(false);
    }
  };

  const useSampleDeals = () => {
    setTrendingDeals([
      {
        id: "1",
        title: "Summer Collection 2025",
        brandName: "FashionNova",
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
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
        imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
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
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
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
        imageUrl: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
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
