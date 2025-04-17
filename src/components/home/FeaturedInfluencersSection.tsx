
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .eq('is_featured', true)
        .limit(4);
      
      if (error) {
        console.error("Error fetching featured influencers:", error);
      } else {
        if (data.length === 0) {
          const { data: regularData, error: regularError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_influencer', true)
            .limit(4);
            
          if (!regularError && regularData.length > 0) {
            await transformAndSetInfluencers(regularData);
          } else {
            setFeaturedInfluencers([
              {
                id: "1",
                full_name: "Sophia Chen",
                username: "sophiastyle",
                avatar_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
                category: "Fashion"
              },
              {
                id: "2",
                full_name: "Marcus Johnson",
                username: "marcusfitness",
                avatar_url: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
                category: "Fitness"
              },
              {
                id: "3",
                full_name: "Emma Wilson",
                username: "emmaeats",
                avatar_url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
                category: "Food"
              },
              {
                id: "4",
                full_name: "Alex Rivera",
                username: "alextech",
                avatar_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
                category: "Tech"
              },
            ]);
          }
        } else {
          await transformAndSetInfluencers(data);
        }
      }
    } catch (error) {
      console.error("Error in fetchFeaturedInfluencers:", error);
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

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold">Featured Influencers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore?tab=influencers" className="flex items-center text-xs">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-3">Loading featured influencers...</div>
        ) : isMobile ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {featuredInfluencers.map((influencer) => (
                <CarouselItem key={influencer.id} className="pl-1 md:pl-2 basis-[85%] md:basis-1/4">
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
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
