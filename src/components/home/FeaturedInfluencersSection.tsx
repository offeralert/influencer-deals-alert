
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InfluencerCard from "@/components/ui/influencer-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  category?: string;
}

const FeaturedInfluencersSection = () => {
  const [featuredInfluencers, setFeaturedInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchFeaturedInfluencers();
  }, []);

  const fetchFeaturedInfluencers = async () => {
    try {
      setLoading(true);
      
      // Get profiles that are both featured AND influencers
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .eq('is_featured', true)
        .limit(5);
      
      if (error) {
        console.error("Error fetching featured influencers:", error);
        setFeaturedInfluencers([]);
      } else {
        if (data.length > 0) {
          await transformAndSetInfluencers(data);
        } else {
          // If no featured influencers found, set empty array
          // Do not load fallback data or default influencers
          setFeaturedInfluencers([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchFeaturedInfluencers:", error);
      setFeaturedInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetInfluencers = async (data: any[]) => {
    try {
      const baseInfluencers = data.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'influencer',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
      }));
      
      setFeaturedInfluencers(baseInfluencers);
    } catch (error) {
      console.error("Error in transformAndSetInfluencers:", error);
    }
  };

  // Don't render the section at all if no featured influencers
  if (featuredInfluencers.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-3 md:py-4 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h2 className="text-base md:text-lg font-semibold">Featured Influencers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore?tab=influencers" className="flex items-center text-xs">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">Loading featured influencers...</p>
          </div>
        ) : isMobile ? (
          <Carousel
            opts={{
              align: "start",
              loop: featuredInfluencers.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {featuredInfluencers.map((influencer) => (
                <CarouselItem key={influencer.id} className="pl-1 md:pl-2 basis-[85%] md:basis-1/5">
                  <InfluencerCard
                    id={influencer.id}
                    name={influencer.full_name}
                    username={influencer.username}
                    imageUrl={influencer.avatar_url}
                    category={influencer.category}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {featuredInfluencers.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </>
            )}
          </Carousel>
        ) : (
          <div className={`grid grid-cols-${Math.min(featuredInfluencers.length, 5)} md:grid-cols-${Math.min(featuredInfluencers.length, 5)} lg:grid-cols-${Math.min(featuredInfluencers.length, 5)} gap-2 md:gap-3`}>
            {featuredInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.id}
                id={influencer.id}
                name={influencer.full_name}
                username={influencer.username}
                imageUrl={influencer.avatar_url}
                category={influencer.category}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedInfluencersSection;
