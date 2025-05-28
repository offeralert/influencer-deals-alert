
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import DownloadBanner from "@/components/home/DownloadBanner";
import FeaturedAccountsSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import BrowserExtensionPromo from "@/components/home/BrowserExtensionPromo";
import { Separator } from "@/components/ui/separator";
import CategoryDealsSection from "@/components/home/CategoryDealsSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useMetaTracking } from "@/hooks/useMetaTracking";
import { useEffect } from "react";
import { createViewContentPayload } from "@/utils/metaTrackingHelpers";

const Index = () => {
  const { user, profile } = useAuth();
  const { track } = useMetaTracking();
  
  // Check if the user is an influencer
  const isInfluencer = profile?.is_influencer === true;

  // Track homepage view
  useEffect(() => {
    track('ViewContent', createViewContentPayload({
      content_name: 'homepage',
      content_category: 'main_page',
      value: 0
    }));
  }, [track]);

  // Special view for influencers
  if (user && isInfluencer) {
    return (
      <div className="min-h-screen">
        <div className="section-container bg-gradient-to-br from-brand-paleGreen to-white py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome, {profile?.full_name || profile?.username || 'Influencer'}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Manage your promo codes from your influencer dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-brand-green hover:bg-brand-green/90" asChild>
                <Link to="/influencer-dashboard">
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/my-deals">
                  View My Alerts
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container bg-white shadow-sm">
          <FeaturedOffersSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container bg-white shadow-sm">
          <PopularCategoriesSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <BrowserExtensionPromo />
        </div>
      </div>
    );
  }

  // Regular user view (existing code)
  return (
    <div className={`min-h-screen ${user ? 'pb-0' : ''}`}>
      <div className="section-container">
        {user ? <DownloadBanner /> : <HeroSection />}
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedAccountsSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedOffersSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <PopularCategoriesSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container">
        {user ? <BrowserExtensionPromo /> : <CallToActionSection />}
      </div>
    </div>
  );
};

export default Index;
