
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import MyAlerts from "./pages/MyAlerts";
import Explore from "./pages/Explore";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import HowItWorks from "./pages/HowItWorks";
import WhyJoin from "./pages/WhyJoin";
import InfluencerApply from "./pages/InfluencerApply";
import AffiliateProgram from "./pages/AffiliateProgram";
import Origin from "./pages/Origin";
import Pricing from "./pages/Pricing";
import CsvUpload from "./pages/CsvUpload";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ManageInfluencerCodes from "./pages/ManageInfluencerCodes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="profile" element={<Profile />} />
              <Route path="my-deals" element={<MyAlerts />} />
              <Route path="explore" element={<Explore />} />
              <Route path="influencer/:identifier" element={<InfluencerProfile />} />
              <Route path="brand/:brandName" element={<BrandProfile />} />
              <Route path="influencer-dashboard" element={<InfluencerDashboard />} />
              <Route path="agency-dashboard" element={<AgencyDashboard />} />
              <Route path="manage-influencer-codes/:influencerId" element={<ManageInfluencerCodes />} />
              <Route path="categories" element={<Categories />} />
              <Route path="brands" element={<Brands />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="why-join" element={<WhyJoin />} />
              <Route path="influencer-apply" element={<InfluencerApply />} />
              <Route path="affiliate-program" element={<AffiliateProgram />} />
              <Route path="origin" element={<Origin />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="csv-upload" element={<CsvUpload />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
