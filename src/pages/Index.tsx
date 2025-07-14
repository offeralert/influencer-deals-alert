
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import StaticOnlyHeroSection from "@/components/home/StaticOnlyHeroSection";
import PersonalizedWelcomeBanner from "@/components/home/PersonalizedWelcomeBanner";
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
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getDashboardRoute } from "@/utils/authRedirectUtils";

const Index = () => {
  const { user, profile, loading, isReady } = useAuth();
  const navigate = useNavigate();

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // For non-logged-in users, show the educational flow
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

  // For authenticated users, redirect to their dashboard when ready
  useEffect(() => {
    if (user && isReady) {
      console.log("Authenticated user, redirecting to dashboard");
      const dashboardRoute = getDashboardRoute(profile);
      navigate(dashboardRoute);
    }
  }, [user, profile, isReady, navigate]);

  // Show loading while we redirect authenticated users
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
