
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { DealCardSkeleton } from "@/components/ui/deal-card-skeleton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getAvatarUrl } from "@/utils/avatarUtils";

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

const FeaturedOffersSection = () => {
  const [featuredOffers, setFeaturedOffers] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedOffers();
  }, []);

  const fetchFeaturedOffers = async () => {
    try {
      setLoading(true);
      
      // Get featured offers from promo_codes with profiles join
      const { data, error } = await getPromoCodes()
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
        const { data: recentData, error: recentError } = await getPromoCodes()
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

  const transformAndSetOffers = (data: PromoCodeWithInfluencer[]) => {
    if (!Array.isArray(data)) {
      console.error("Expected array but received:", data);
      setFeaturedOffers([]);
      return;
    }
    
    // Transform to our Deal interface
    const formattedOffers = data.map(offer => ({
      id: offer.id || "",
      title: offer.description || "",
      brandName: offer.brand_name || "",
      discount: offer.promo_code || "",
      promoCode: offer.promo_code || "",
      expiryDate: offer.expiration_date,
      affiliateLink: offer.affiliate_link || "#",
      influencerName: offer.profiles?.full_name || 'Unknown Influencer',
      influencerImage: getAvatarUrl(offer.profiles?.avatar_url) || "",
      influencerUsername: offer.profiles?.username || 'unknown',
      category: offer.category || 'Fashion'
    }));
    
    setFeaturedOffers(formattedOffers);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 4 }, (_, index) => (
      <CarouselItem key={`skeleton-${index}`} className="pl-1 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/4">
        <DealCardSkeleton />
      </CarouselItem>
    ));
  };

  return (
    <section className="py-3 md:py-4 bg-white">
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
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-4">
              {renderSkeletons()}
            </CarouselContent>
          </Carousel>
        ) : featuredOffers.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-4">
              {featuredOffers.map((offer) => (
                <CarouselItem key={offer.id} className="pl-1 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/4">
                  <DealCard {...offer} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
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
