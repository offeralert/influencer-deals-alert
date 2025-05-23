import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useNavigate, useLocation } from "react-router-dom";
import PromoCodeForm from "@/components/PromoCodeForm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SubscriptionStatusCard from "@/components/dashboard/SubscriptionStatusCard";
import BypassNotificationBanner from "@/components/dashboard/BypassNotificationBanner";
import PromoCodeList from "@/components/dashboard/PromoCodeList";
import CancellationDialog from "@/components/dashboard/CancellationDialog";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
  category: string;
}

const InfluencerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
  const [editingPromoCodeId, setEditingPromoCodeId] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [refreshingSubscription, setRefreshingSubscription] = useState(false);
  
  // Extract action from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get('action');
  
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    maxOffers,
    isLoading: loadingSubscription,
    refresh: refreshSubscription,
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();

  // Show cancel dialog if action=cancel in URL
  useEffect(() => {
    if (action === 'cancel' && subscribed) {
      setShowCancelDialog(true);
      // Clean up URL parameter after showing dialog
      navigate('/influencer-dashboard', { replace: true });
    }
  }, [action, subscribed, navigate]);

  // Use our auth gate hook to check if user is authorized to view this page
  const { isLoading: authLoading, isAuthorized } = useAuthGate({
    requiredRole: "influencer",
    redirectTo: "/login"
  });

  useEffect(() => {
    if (user) {
      console.log("Fetching promo codes for user:", user.id);
      fetchPromoCodes();

      // Subscribe to changes in the promo_codes table
      const promoChangesChannel = supabase
        .channel('promo-code-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'promo_codes',
            filter: `influencer_id=eq.${user.id}`
          },
          (payload) => {
            // Refresh local list
            fetchPromoCodes();
            
            // The database trigger will now handle the user_domain_map updates automatically
            if (payload.eventType === 'INSERT') {
              toast.success("New promo code added");
              toast.info("Your followers' domain mappings are being updated automatically");
            } else if (payload.eventType === 'DELETE') {
              toast.success("Promo code deleted");
              toast.info("Your followers' domain mappings are being updated automatically");
            } else if (payload.eventType === 'UPDATE') {
              toast.success("Promo code updated");
              
              // Check if affiliate link changed
              const oldLink = payload.old?.affiliate_link;
              const newLink = payload.new?.affiliate_link;
              
              if (oldLink !== newLink) {
                toast.info("Affiliate link changed, domain mappings are being updated automatically");
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(promoChangesChannel);
      };
    }
  }, [user]);

  const fetchPromoCodes = async () => {
    if (!user) return;
    
    setLoadingPromoCodes(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
    } finally {
      setLoadingPromoCodes(false);
    }
  };

  const handlePromoCodeAdded = async () => {
    fetchPromoCodes();
  };

  const handlePromoCodeUpdated = async () => {
    fetchPromoCodes();
    setEditingPromoCodeId(null);
  };

  // Handle manual deletion of promo code
  const handleDeletePromoCode = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete the promo code - the database trigger will handle domain mapping updates
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting promo code:", error);
        toast.error("Failed to delete promo code");
        return;
      }
      
      toast.success("Promo code deleted");
      
      // Fetch updated list
      fetchPromoCodes();
    } catch (error) {
      console.error("Error in handleDeletePromoCode:", error);
      toast.error("An error occurred while deleting the promo code");
    }
  };

  const handleManualRefresh = async () => {
    setRefreshingSubscription(true);
    try {
      await refreshSubscription();
      toast.success("Subscription status refreshed");
    } catch (error) {
      toast.error("Failed to refresh subscription status");
    } finally {
      setRefreshingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setIsCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) {
        console.error("Error canceling subscription:", error);
        toast.error("Failed to cancel subscription");
        return;
      }
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      toast.success("Your subscription has been canceled successfully");
      refreshSubscription();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error in handleCancelSubscription:", error);
      toast.error("An error occurred while canceling your subscription");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpgradeClick = async (planType: "Growth" | "Pro" | "Elite") => {
    const url = await createCheckoutSession(planType);
    if (url) {
      window.location.href = url;
    }
  };

  const handleManageSubscription = async () => {
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Unable to open customer portal. Please try again later.");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open customer portal. Please try again later.");
    }
  };

  // Show loading state while authentication checks are being performed
  if (authLoading || loadingSubscription) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading dashboard...</div>
          <div className="text-muted-foreground">Please wait while we verify your account</div>
        </div>
      </div>
    );
  }

  // Not showing dashboard if not authorized (redirect handled by the hook)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader 
          handleManageSubscription={handleManageSubscription}
          setShowCancelDialog={setShowCancelDialog}
          isCanceling={isCanceling}
          subscribed={subscribed}
        />
        
        {/* Bypass Notification Banner */}
        <BypassNotificationBanner show={BYPASS_OFFER_LIMITS} />
        
        {/* Subscription Status Card */}
        <SubscriptionStatusCard 
          subscribed={subscribed}
          subscriptionTier={subscriptionTier}
          subscriptionEnd={subscriptionEnd}
          promoCodes={promoCodes}
          maxOffers={maxOffers}
          bypassOfferLimits={BYPASS_OFFER_LIMITS}
          refreshingSubscription={refreshingSubscription}
          handleManualRefresh={handleManualRefresh}
          handleManageSubscription={handleManageSubscription}
          setShowCancelDialog={setShowCancelDialog}
          isCanceling={isCanceling}
        />
        
        <Tabs defaultValue="promocodes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
            <TabsTrigger value="add">Add New Promo Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="promocodes">
            <PromoCodeList 
              promoCodes={promoCodes}
              loadingPromoCodes={loadingPromoCodes}
              onEditPromoCode={setEditingPromoCodeId}
              onDeletePromoCode={handleDeletePromoCode}
              onPromoCodeUpdated={handlePromoCodeUpdated}
              editingPromoCodeId={editingPromoCodeId}
              onCancelEdit={() => setEditingPromoCodeId(null)}
            />
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <PromoCodeForm onPromoCodeAdded={handlePromoCodeAdded} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscription Cancellation Confirmation Dialog */}
      <CancellationDialog 
        showDialog={showCancelDialog}
        setShowDialog={setShowCancelDialog}
        handleCancelSubscription={handleCancelSubscription}
        isCanceling={isCanceling}
        promoCodes={promoCodes}
      />
    </div>
  );
};

export default InfluencerDashboard;
