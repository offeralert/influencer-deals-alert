
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import Explore from "./pages/Explore";
import MyDeals from "./pages/MyDeals";
import InfluencerApply from "./pages/InfluencerApply";
import CsvUpload from "./pages/CsvUpload";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import Brands from "./pages/Brands";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import AffiliateProgram from "./pages/AffiliateProgram";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/my-deals" element={<MyDeals />} />
              <Route path="/influencer-apply" element={<InfluencerApply />} />
              <Route path="/csv-upload" element={<CsvUpload />} />
              <Route path="/influencer-dashboard" element={<InfluencerDashboard />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/influencer/:id" element={<InfluencerProfile />} />
              <Route path="/brand/:brandName" element={<BrandProfile />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/affiliate-program" element={<AffiliateProgram />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
