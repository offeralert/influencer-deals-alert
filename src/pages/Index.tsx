
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InfluencerCard from "@/components/ui/influencer-card";
import { DealCard } from "@/components/ui/deal-card";
import CategoryCard from "@/components/ui/category-card";
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

const Index = () => {
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
        // If we don't have any featured influencers, fallback to regular influencers
        if (data.length === 0) {
          const { data: regularData, error: regularError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_influencer', true)
            .limit(4);
            
          if (!regularError && regularData.length > 0) {
            transformAndSetInfluencers(regularData);
          } else {
            // Fallback to sample data if no real influencers are available
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

  const transformAndSetInfluencers = (data: any[]) => {
    const formattedInfluencers = data.map(profile => ({
      id: profile.id,
      full_name: profile.full_name || 'Unnamed Influencer',
      username: profile.username || 'influencer',
      avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      followers_count: Math.floor(Math.random() * 100000) + 5000, // Placeholder
      category: 'Lifestyle' // Placeholder
    }));
    
    setFeaturedInfluencers(formattedInfluencers);
  };

  // Sample data for trending deals and categories
  const trendingDeals = [
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
    },
  ];

  const popularCategories = [
    {
      id: "1",
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      href: "/category/fashion",
      count: 156,
    },
    {
      id: "2",
      name: "Fitness",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      href: "/category/fitness",
      count: 94,
    },
    {
      id: "3",
      name: "Food",
      image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
      href: "/category/food",
      count: 127,
    },
    {
      id: "4",
      name: "Tech",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      href: "/category/tech",
      count: 83,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brand-light dark:bg-brand-dark">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover <span className="gradient-text">Exclusive Deals</span> From Your Favorite Influencers
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with influencers you love and unlock special discounts, affiliate links, and promo codes that you won't find anywhere else.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/explore">Explore Deals</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                alt="Influencer marketing" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -top-6 -right-6 bg-white dark:bg-brand-dark p-4 rounded-lg shadow-lg">
                <div className="gradient-bg p-1 rounded-md text-white font-medium text-sm">30% OFF</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-brand-dark p-4 rounded-lg shadow-lg">
                <div className="gradient-bg p-1 rounded-md text-white font-medium text-sm">SUMMER30</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Influencers</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/explore" className="flex items-center">
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

      {/* Trending Deals */}
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

      {/* Popular Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Popular Categories</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/categories" className="flex items-center">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularCategories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                image={category.image}
                href={category.href}
                count={category.count}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 gradient-bg" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Saving?</h2>
            <p className="text-lg text-muted-foreground">
              Create an account today to follow your favorite influencers and get access to exclusive deals and promo codes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/influencer-apply">Apply as Influencer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
