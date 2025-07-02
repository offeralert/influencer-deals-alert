
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Suspense, lazy } from "react";

// Critical routes loaded immediately
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy load non-critical routes for better performance
const Profile = lazy(() => import("./pages/Profile"));
const MyAlerts = lazy(() => import("./pages/MyAlerts"));
const Explore = lazy(() => import("./pages/Explore"));
const Deals = lazy(() => import("./pages/Deals"));
const Influencers = lazy(() => import("./pages/Influencers"));
const Brands = lazy(() => import("./pages/Brands"));
const CreditCards = lazy(() => import("./pages/CreditCards"));
const InfluencerProfile = lazy(() => import("./pages/InfluencerProfile"));
const BrandProfile = lazy(() => import("./pages/BrandProfile"));
const InfluencerDashboard = lazy(() => import("./pages/InfluencerDashboard"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const Categories = lazy(() => import("./pages/Categories"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const WhyJoin = lazy(() => import("./pages/WhyJoin"));
const InfluencerApply = lazy(() => import("./pages/InfluencerApply"));
const AffiliateProgram = lazy(() => import("./pages/AffiliateProgram"));
const Origin = lazy(() => import("./pages/Origin"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CsvUpload = lazy(() => import("./pages/CsvUpload"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ManageInfluencerCodes = lazy(() => import("./pages/ManageInfluencerCodes"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile" element={
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            } />
            <Route path="my-deals" element={
              <Suspense fallback={<PageLoader />}>
                <MyAlerts />
              </Suspense>
            } />
            <Route path="explore" element={
              <Suspense fallback={<PageLoader />}>
                <Explore />
              </Suspense>
            } />
            <Route path="deals" element={
              <Suspense fallback={<PageLoader />}>
                <Deals />
              </Suspense>
            } />
            <Route path="influencers" element={
              <Suspense fallback={<PageLoader />}>
                <Influencers />
              </Suspense>
            } />
            <Route path="brands" element={
              <Suspense fallback={<PageLoader />}>
                <Brands />
              </Suspense>
            } />
            <Route path="credit-cards" element={
              <Suspense fallback={<PageLoader />}>
                <CreditCards />
              </Suspense>
            } />
            <Route path="influencer/:username" element={
              <Suspense fallback={<PageLoader />}>
                <InfluencerProfile />
              </Suspense>
            } />
            <Route path="brand/:brandName" element={
              <Suspense fallback={<PageLoader />}>
                <BrandProfile />
              </Suspense>
            } />
            <Route path="influencer-dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <InfluencerDashboard />
              </Suspense>
            } />
            <Route path="agency-dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <AgencyDashboard />
              </Suspense>
            } />
            <Route path="manage-influencer-codes/:influencerId" element={
              <Suspense fallback={<PageLoader />}>
                <ManageInfluencerCodes />
              </Suspense>
            } />
            <Route path="categories" element={
              <Suspense fallback={<PageLoader />}>
                <Categories />
              </Suspense>
            } />
            <Route path="contact" element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            } />
            <Route path="terms" element={
              <Suspense fallback={<PageLoader />}>
                <Terms />
              </Suspense>
            } />
            <Route path="privacy" element={
              <Suspense fallback={<PageLoader />}>
                <Privacy />
              </Suspense>
            } />
            <Route path="how-it-works" element={
              <Suspense fallback={<PageLoader />}>
                <HowItWorks />
              </Suspense>
            } />
            <Route path="why-join" element={
              <Suspense fallback={<PageLoader />}>
                <WhyJoin />
              </Suspense>
            } />
            <Route path="influencer-apply" element={
              <Suspense fallback={<PageLoader />}>
                <InfluencerApply />
              </Suspense>
            } />
            <Route path="affiliate-program" element={
              <Suspense fallback={<PageLoader />}>
                <AffiliateProgram />
              </Suspense>
            } />
            <Route path="origin" element={
              <Suspense fallback={<PageLoader />}>
                <Origin />
              </Suspense>
            } />
            <Route path="pricing" element={
              <Suspense fallback={<PageLoader />}>
                <Pricing />
              </Suspense>
            } />
            <Route path="csv-upload" element={
              <Suspense fallback={<PageLoader />}>
                <CsvUpload />
              </Suspense>
            } />
            <Route path="forgot-password" element={
              <Suspense fallback={<PageLoader />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="reset-password" element={
              <Suspense fallback={<PageLoader />}>
                <ResetPassword />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
