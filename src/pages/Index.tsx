
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

  // For authenticated users, redirect to their dashboard immediately when ready
  useEffect(() => {
    if (user && isReady) {
      console.log("Authenticated user detected, redirecting to dashboard");
      const dashboardRoute = getDashboardRoute(profile);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, profile, isReady, navigate]);

  // Show loading state only while initial auth check is happening
  if (loading && user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // For authenticated users who haven't redirected yet, show minimal loading
  if (user && isReady) {
    return null; // This will be very brief as the useEffect will redirect immediately
  }

  // For non-logged-in users, show the educational flow
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
};

export default Index;
