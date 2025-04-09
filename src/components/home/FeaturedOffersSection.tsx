
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
      
      // First, get valid influencer IDs (users with is_influencer = true)
      const { data: influencerProfiles, error: influencerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_influencer', true);
      
      if (influencerError) {
        console.error("Error fetching influencer profiles:", influencerError);
        setFeaturedOffers([]);
        setLoading(false);
        return;
      }
      
      // Extract the influencer IDs
      const influencerIds = influencerProfiles.map(profile => profile.id);
      
      if (influencerIds.length === 0) {
        console.log("No influencers found");
        setFeaturedOffers([]);
        setLoading(false);
        return;
      }
      
      // Try to get featured promo codes first (if column exists)
      let query = supabase
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
        .in('user_id', influencerIds);
      
      // Get featured offers first, if available
      const { data: featuredData, error: featuredError } = await query
        .eq('is_featured', true)
        .limit(4);
      
      // If error about is_featured not existing, or no featured data, get most recent offers
      if (featuredError || !featuredData || featuredData.length === 0) {
        console.log("No featured offers found or is_featured doesn't exist, getting recent offers");
        
        // Get most recent offers instead - no expiration filtering
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
            profiles:user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .in('user_id', influencerIds)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (recentError) {
          console.error("Error fetching recent offers:", recentError);
          setFeaturedOffers([]);
          setLoading(false);
          return;
        }
        
        if (!recentData || recentData.length === 0) {
          console.log("No recent offers found");
          setFeaturedOffers([]);
          setLoading(false);
          return;
        }
        
        transformAndSetOffers(recentData as PromoCodeRecord[]);
      } else {
        transformAndSetOffers(featuredData as PromoCodeRecord[]);
      }
    } catch (error) {
      console.error("Error in fetchFeaturedOffers:", error);
      setFeaturedOffers([]);
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
      console.log("No valid offers found after filtering");
      setFeaturedOffers([]);
      return;
    }
    
    console.log(`Found ${validOffers.length} valid offers`);
    
    // Transform to our Deal interface
    const formattedOffers = validOffers.map(offer => ({
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
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading offers...</p>
            </div>
          ) : featuredOffers.length > 0 ? (
            featuredOffers.map((offer) => (
              <DealCard key={offer.id} {...offer} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No featured offers available right now.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffersSection;
