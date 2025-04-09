
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
  is_featured: boolean | null;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const FeaturedOffersSection = () => {
  const [featuredOffers, setFeaturedOffers] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedOffers();
  }, []);

  const fetchFeaturedOffers = async () => {
    try {
      setLoading(true);
      
      // Get today's date for filtering expired codes
      const today = new Date().toISOString().split('T')[0];
      
      // Get featured promo codes from influencers
      const { data: featuredData, error: featuredError } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          expiration_date,
          affiliate_link,
          category,
          is_featured,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('is_featured', true)
        .or(`expiration_date.gt.${today},expiration_date.is.null`)
        .order('created_at', { ascending: false });
      
      if (featuredError) {
        console.error("Error fetching featured offers:", featuredError);
        useSampleOffers();
        return;
      }
      
      // If no featured offers found, get the most recent ones from influencers
      if (!featuredData || featuredData.length === 0) {
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
            is_featured,
            profiles:user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('is_featured', false)
          .or(`expiration_date.gt.${today},expiration_date.is.null`)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (recentError) {
          console.error("Error fetching recent offers:", recentError);
          useSampleOffers();
          return;
        }
        
        if (!recentData || recentData.length === 0) {
          useSampleOffers();
          return;
        }
        
        transformAndSetOffers(recentData as PromoCodeRecord[]);
      } else {
        transformAndSetOffers(featuredData as PromoCodeRecord[]);
      }
    } catch (error) {
      console.error("Error in fetchFeaturedOffers:", error);
      useSampleOffers();
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetOffers = (data: PromoCodeRecord[]) => {
    // Filter out incomplete deals
    const validOffers = data.filter(offer => 
      offer.brand_name && 
      offer.promo_code && 
      offer.description &&
      offer.profiles?.full_name
    );
    
    if (validOffers.length === 0) {
      useSampleOffers();
      return;
    }
    
    // Limit to 4 offers maximum
    const selectedOffers = validOffers.slice(0, 4);
    
    // Transform to our Deal interface
    const formattedOffers = selectedOffers.map(offer => ({
      id: offer.id,
      title: offer.description,
      brandName: offer.brand_name,
      discount: offer.promo_code,
      promoCode: offer.promo_code,
      expiryDate: offer.expiration_date,
      affiliateLink: offer.affiliate_link || "#",
      influencerName: offer.profiles?.full_name || 'Unknown Influencer',
      influencerImage: offer.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      category: offer.category || 'Fashion'
    }));
    
    setFeaturedOffers(formattedOffers);
  };

  const useSampleOffers = () => {
    setFeaturedOffers([
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
          <h2 className="text-2xl font-bold">Featured Offers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredOffers.map((offer) => (
            <DealCard key={offer.id} {...offer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffersSection;
