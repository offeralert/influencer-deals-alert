
import { useAuth } from "@/contexts/AuthContext";
import { useDeferredAuth } from "@/contexts/DeferredAuthContext";
import HeroSection from "@/components/home/HeroSection";
import StaticOnlyHeroSection from "@/components/home/StaticOnlyHeroSection";
import DownloadBanner from "@/components/home/DownloadBanner";
import FeaturedAccountsSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import BrowserExtensionPromo from "@/components/home/BrowserExtensionPromo";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AddToDesktopSection from "@/components/home/AddToDesktopSection";
import WhyItMattersSection from "@/components/home/WhyItMattersSection";
import OfferAlertAdvantageSection from "@/components/home/OfferAlertAdvantageSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useProgressiveEnhancement } from "@/hooks/useProgressiveEnhancement";
import { useDeferredMetaTracking } from "@/hooks/useDeferredMetaTracking";
import { useDeferredPerformanceMonitoring } from "@/hooks/useDeferredPerformanceMonitoring";
import { useEffect, Suspense, lazy, startTransition } from "react";
import { createViewContentPayload } from "@/utils/metaTrackingHelpers";

// Only lazy load non-critical, below-the-fold sections
const LazyPopularCategoriesSection = lazy(() => import("@/components/home/PopularCategoriesSection"));
const LazyBrowserExtensionPromo = lazy(() => import("@/components/home/BrowserExtensionPromo"));

const Index = () => {
  const { user, profile } = useAuth();
  const deferredAuth = useDeferredAuth();
  const isEnhanced = useProgressiveEnhancement();
  const { track } = useDeferredMetaTracking();
  
  // Enable deferred performance monitoring only after enhancement
  useDeferredPerformanceMonitoring();
  
  // Check if the user is an influencer or agency (only after auth is loaded)
  const isInfluencer = isEnhanced && deferredAuth.initialized ? deferredAuth.profile?.is_influencer === true : false;
  const isAgency = isEnhanced && deferredAuth.initialized ? deferredAuth.profile?.is_agency === true : false;
  const enhancedUser = isEnhanced && deferredAuth.initialized ? deferredAuth.user : null;

  // Track homepage view with deferred execution (only after enhancement)
  useEffect(() => {
    if (!isEnhanced) return;
    
    const timer = setTimeout(() => {
      startTransition(() => {
        track('ViewContent', createViewContentPayload({
          content_name: 'homepage',
          content_category: 'main_page',
          value: 0
        }));
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [track, isEnhanced]);

  // NEW EDUCATIONAL FLOW for non-logged-in users - Show immediately without progressive enhancement
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="section-container">
          <StaticOnlyHeroSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <HowItWorksSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <AddToDesktopSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <WhyItMattersSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <OfferAlertAdvantageSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <CallToActionSection />
        </div>
      </div>
    );
  }

  // For logged-in users, use progressive enhancement and existing functionality
  if (!isEnhanced) {
    return (
      <div className="min-h-screen">
        <div className="section-container">
          <HeroSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container bg-white shadow-sm">
          <FeaturedOffersSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <CallToActionSection />
        </div>
      </div>
    );
  }

  // Special view for agencies (only after enhancement)
  if (enhancedUser && isAgency) {
    return (
      <div className="min-h-screen">
        <div className="section-container bg-gradient-to-br from-purple-50 to-white py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Your Agency Dashboard</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Manage your influencers and promo codes all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-600/90" asChild>
                <Link to="/agency-dashboard">
                  Go to Agency Dashboard
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
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
            <LazyPopularCategoriesSection />
          </Suspense>
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
            <LazyBrowserExtensionPromo />
          </Suspense>
        </div>
      </div>
    );
  }

  // Special view for influencers (only after enhancement)
  if (enhancedUser && isInfluencer) {
    return (
      <div className="min-h-screen">
        <div className="section-container bg-gradient-to-br from-brand-paleGreen to-white py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome, {deferredAuth.profile?.full_name || deferredAuth.profile?.username || 'Influencer'}</h1>
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
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
            <LazyPopularCategoriesSection />
          </Suspense>
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
            <LazyBrowserExtensionPromo />
          </Suspense>
        </div>
      </div>
    );
  }

  // Regular user view - load critical sections immediately
  return (
    <div className={`min-h-screen ${enhancedUser ? 'pb-0' : ''}`}>
      <div className="section-container">
        {enhancedUser ? (
          <DownloadBanner />
        ) : (
          <HeroSection />
        )}
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedOffersSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedAccountsSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
          <LazyPopularCategoriesSection />
        </Suspense>
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container">
        {enhancedUser ? (
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
            <LazyBrowserExtensionPromo />
          </Suspense>
        ) : (
          <CallToActionSection />
        )}
      </div>
    </div>
  );
};

export default Index;
