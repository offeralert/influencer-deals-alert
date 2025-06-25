
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileFooter from "./MobileFooter";
import CacheClearButton from "@/components/CacheClearButton";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useProgressiveEnhancement } from "@/hooks/useProgressiveEnhancement";
import { useUpdateManager } from "@/hooks/useUpdateManager";
import { CACHE_VERSION } from "@/utils/cacheUtils";

const MainLayout = () => {
  const isEnhanced = useProgressiveEnhancement();
  
  // Always call hooks, but pass the enhancement state to control their behavior
  useUpdateManager(isEnhanced);
  useScrollToTop(isEnhanced);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
        {/* Only show mobile footer after enhancement to avoid layout shifts */}
        <div className="md:hidden">
          {isEnhanced && <MobileFooter />}
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      {/* Only show bottom nav after enhancement to avoid layout shifts */}
      <div className="md:hidden">
        {isEnhanced && <BottomNav />}
      </div>
      
      {/* Debug info - only show in development or when needed */}
      {(process.env.NODE_ENV === 'development' || window.location.search.includes('debug=cache')) && (
        <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow border text-xs space-y-1">
          <div>Version: {CACHE_VERSION}</div>
          <CacheClearButton />
        </div>
      )}
      
      <SonnerToaster position="top-right" />
      <Toaster />
    </div>
  );
};

export default MainLayout;
