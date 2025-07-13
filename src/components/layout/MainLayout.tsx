
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileFooter from "./MobileFooter";
import { Toaster as SonnerToaster } from "sonner";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
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
      <SonnerToaster position="top-right" />
    </div>
  );
};

export default MainLayout;
