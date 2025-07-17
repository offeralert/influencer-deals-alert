
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useUpdateManager } from "@/hooks/useUpdateManager";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Deals from "./pages/Deals";
import Influencers from "./pages/Influencers";
import Brands from "./pages/Brands";
import CreditCards from "./pages/CreditCards";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import Categories from "./pages/Categories";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Index />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="explore" element={<Explore />} />
        <Route path="deals" element={<Deals />} />
        <Route path="influencers" element={<Influencers />} />
        <Route path="brands" element={<Brands />} />
        <Route path="credit-cards" element={<CreditCards />} />
        <Route path="influencer/:username" element={<InfluencerProfile />} />
        <Route path="brand/:brandName" element={<BrandProfile />} />
        <Route path="influencer-dashboard" element={
          <ProtectedRoute requireAuth={true}>
            <InfluencerDashboard />
          </ProtectedRoute>
        } />
        <Route path="agency-dashboard" element={
          <ProtectedRoute requireAuth={true} requireAgency={true}>
            <AgencyDashboard />
          </ProtectedRoute>
        } />
        <Route path="manage-influencer-codes/:influencerId" element={<ManageInfluencerCodes />} />
        <Route path="categories" element={<Categories />} />
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
  );
};

const AppWithUpdateManager = () => {
  return (
    <AuthProvider>
      <AppContentWithUpdates />
    </AuthProvider>
  );
};

const AppContentWithUpdates = () => {
  // Only enable update manager in production or when specifically needed
  const updateManager = useUpdateManager(process.env.NODE_ENV === 'production');
  
  return <AppContent />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWithUpdateManager />
        <SpeedInsights />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
