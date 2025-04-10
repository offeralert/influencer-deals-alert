
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InfluencerCard from "@/components/ui/influencer-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  followers_count?: number;
  category?: string;
}

const FeaturedInfluencersSection = () => {
  const [featuredInfluencers, setFeaturedInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

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
            transformAndSetInfluencers(regularData);
          } else {
            setFeaturedInfluencers([
              {
                id: "1",
                full_name: "Sophia Chen",
                username: "sophiastyle",
                avatar_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
                followers_count: 125000,
                category: "Fashion"
              },
              {
                id: "2",
                full_name: "Marcus Johnson",
                username: "marcusfitness",
                avatar_url: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
                followers_count: 89000,
                category: "Fitness"
              },
              {
                id: "3",
                full_name: "Emma Wilson",
                username: "emmaeats",
                avatar_url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
                followers_count: 235000,
                category: "Food"
              },
              {
                id: "4",
                full_name: "Alex Rivera",
                username: "alextech",
                avatar_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
                followers_count: 310000,
                category: "Tech"
              },
            ]);
          }
        } else {
          transformAndSetInfluencers(data);
        }
      }
    } catch (error) {
      console.error("Error in fetchFeaturedInfluencers:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetInfluencers = async (data: any[]) => {
    const baseInfluencers = data.map(profile => ({
      id: profile.id,
      full_name: profile.full_name || 'Unnamed Influencer',
      username: profile.username || 'influencer',
      avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      followers_count: 0,
      category: 'Lifestyle'
    }));
    
    const influencersWithFollowers = await Promise.all(
      baseInfluencers.map(async (influencer) => {
        try {
          const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('influencer_id', influencer.id);
          
          if (!error) {
            return {
              ...influencer,
              followers_count: count || 0
            };
          }
          return influencer;
        } catch (error) {
          console.error(`Error getting followers for ${influencer.id}:`, error);
          return influencer;
        }
      })
    );
    
    setFeaturedInfluencers(influencersWithFollowers);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Influencers</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore?tab=influencers" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-8">Loading featured influencers...</div>
          ) : (
            featuredInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.id}
                id={influencer.id}
                name={influencer.full_name}
                username={influencer.username}
                imageUrl={influencer.avatar_url}
                category={influencer.category || "Lifestyle"}
                followers={influencer.followers_count || 0}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInfluencersSection;
