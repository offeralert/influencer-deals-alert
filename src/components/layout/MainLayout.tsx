
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileFooter from "./MobileFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import UpdateNotifier from "./UpdateNotifier";

const MainLayout = () => {
  const isMobile = useIsMobile();
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
        {isMobile && <MobileFooter />}
      </main>
      {!isMobile && <Footer />}
      {isMobile && <BottomNav />}
      <SonnerToaster position="top-right" />
      <Toaster />
      <UpdateNotifier />
    </div>
  );
};

export default MainLayout;
