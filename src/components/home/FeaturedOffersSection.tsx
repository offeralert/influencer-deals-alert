
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getUniversalPromoCodes, UniversalPromoCode } from "@/utils/supabaseQueries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  influencerId: string;
  category: string;
}

const FeaturedOffersSection = () => {
  const [featuredOffers, setFeaturedOffers] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchFeaturedOffers();
  }, []);

  const fetchFeaturedOffers = async () => {
    try {
      setLoading(true);
      
      // Get featured offers from the universal_promo_codes view
      const { data, error } = await getUniversalPromoCodes()
        .eq('is_featured', true)
        .limit(4);
      
      if (error) {
        console.error("Error fetching featured offers:", error);
        setFeaturedOffers([]);
        setLoading(false);
        return;
      }
      
      // If no featured offers found, get the most recent ones
      if (!data || data.length === 0) {
        const { data: recentData, error: recentError } = await getUniversalPromoCodes()
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (recentError) {
          console.error("Error fetching recent offers:", recentError);
          setFeaturedOffers([]);
          setLoading(false);
          return;
        }
        
        if (!recentData || recentData.length === 0) {
          console.log("No offers found");
          setFeaturedOffers([]);
          setLoading(false);
          return;
        }
        
        transformAndSetOffers(recentData);
      } else {
        transformAndSetOffers(data);
      }
    } catch (error) {
      console.error("Error in fetchFeaturedOffers:", error);
      setFeaturedOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetOffers = (data: UniversalPromoCode[]) => {
    // Transform to our Deal interface
    const formattedOffers = data.map(offer => ({
      id: offer.id || "",
      title: offer.description || "",
      brandName: offer.brand_name || "",
      discount: offer.promo_code || "",
      promoCode: offer.promo_code || "",
      expiryDate: offer.expiration_date,
      affiliateLink: offer.affiliate_link || "#",
      influencerName: offer.influencer_name || 'Unknown Influencer',
      influencerImage: offer.influencer_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      influencerId: offer.influencer_id || "", // Make sure we include the influencer ID
      category: offer.category || 'Fashion'
    }));
    
    setFeaturedOffers(formattedOffers);
  };

  return (
    <section className="py-3 md:py-4 bg-white"> {/* Updated background to white */}
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h2 className="text-base md:text-lg font-semibold">Featured Offers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore" className="flex items-center text-xs">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="col-span-full text-center py-4 md:py-12">
            <p className="text-muted-foreground text-sm">Loading offers...</p>
          </div>
        ) : featuredOffers.length > 0 ? (
          isMobile ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-1 md:-ml-4">
                {featuredOffers.map((offer) => (
                  <CarouselItem key={offer.id} className="pl-1 md:pl-4 basis-[85%] md:basis-1/3">
                    <DealCard {...offer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredOffers.map((offer) => (
                <DealCard key={offer.id} {...offer} />
              ))}
            </div>
          )
        ) : (
          <div className="col-span-full text-center py-4 md:py-12">
            <p className="text-muted-foreground text-sm">No featured offers available right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedOffersSection;
