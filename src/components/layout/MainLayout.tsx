
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileFooter from "./MobileFooter";
import { Toaster } from "sonner";
import { useCLSOptimization } from "@/hooks/useCLSOptimization";

const MainLayout = () => {
  useCLSOptimization();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pb-16 md:pb-0" data-dynamic-content>
        <Outlet />
        <div className="md:hidden">
          <MobileFooter />
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;
