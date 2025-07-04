
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InfluencerCard from "@/components/ui/influencer-card";
import InfluencerCardSkeleton from "@/components/ui/influencer-card-skeleton";
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

interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  category?: string;
}

const FeaturedAccountsSection = () => {
  const [featuredAccounts, setFeaturedAccounts] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAccounts();
  }, []);

  const fetchFeaturedAccounts = async () => {
    try {
      setLoading(true);
      
      // Get profiles that are featured - changed limit from 5 to 4
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
      
      if (error) {
        console.error("Error fetching featured accounts:", error);
        setFeaturedAccounts([]);
      } else {
        if (data.length > 0) {
          await transformAndSetAccounts(data);
        } else {
          // If no featured accounts found, set empty array
          setFeaturedAccounts([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchFeaturedAccounts:", error);
      setFeaturedAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetAccounts = async (data: any[]) => {
    try {
      const baseAccounts = data.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Account',
        username: profile.username || 'account',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
      }));
      
      setFeaturedAccounts(baseAccounts);
    } catch (error) {
      console.error("Error in transformAndSetAccounts:", error);
    }
  };

  const renderSkeleton = () => {
    return (
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-1 md:-ml-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem key={index} className="pl-1 md:pl-2 basis-[85%] md:basis-1/2 lg:basis-1/4">
              <InfluencerCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  };

  const renderContent = () => {
    if (featuredAccounts.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">No featured accounts available</p>
        </div>
      );
    }

    return (
      <Carousel
        opts={{
          align: "start",
          loop: featuredAccounts.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-1 md:-ml-2">
          {featuredAccounts.map((account) => (
            <CarouselItem 
              key={account.id} 
              className="pl-1 md:pl-2 basis-[85%] md:basis-1/2 lg:basis-1/4"
            >
              <InfluencerCard
                id={account.id}
                name={account.full_name}
                username={account.username}
                imageUrl={account.avatar_url}
                category={account.category}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {featuredAccounts.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
    );
  };

  // Always render the section with consistent height to prevent layout shifts
  return (
    <section className="py-3 md:py-4 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h2 className="text-base md:text-lg font-semibold">Featured Accounts</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore?tab=influencers" className="flex items-center text-xs">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        
        {/* Fixed height container to prevent layout shifts */}
        <div className="min-h-[88px]">
          {loading ? renderSkeleton() : renderContent()}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAccountsSection;
