
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileFooter from "./MobileFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useProgressiveEnhancement } from "@/hooks/useProgressiveEnhancement";
import { useUpdateManager } from "@/hooks/useUpdateManager";

const MainLayout = () => {
  const isEnhanced = useProgressiveEnhancement();
  
  // Only enable update manager after enhancement
  if (isEnhanced) {
    useUpdateManager();
    useScrollToTop();
  }

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
      <SonnerToaster position="top-right" />
      <Toaster />
    </div>
  );
};

export default MainLayout;
