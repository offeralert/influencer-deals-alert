import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PromoCodeForm from "@/components/PromoCodeForm";
import PromoCodeEditor from "@/components/PromoCodeEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
  const [editingPromoCodeId, setEditingPromoCodeId] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
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

  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry < today;
  };
  
  const isExpiringSoon = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    
    // Consider "soon" as within 7 days
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return expiry >= today && expiry <= sevenDaysFromNow;
  };

  const formatSubscriptionEndDate = (dateString: string | null) => {
    if (!dateString) return "No active subscription";
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Check if there are any expired or expiring soon promo codes
  const hasExpiredCodes = promoCodes.some(code => isExpired(code.expiration_date));
  const hasExpiringSoonCodes = promoCodes.some(code => isExpiringSoon(code.expiration_date) && !isExpired(code.expiration_date));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Influencer Dashboard</h1>
          
          <div className="flex items-center gap-2">
            {subscribed ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                >
                  Manage Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCanceling}
                >
                  Cancel Subscription
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/pricing")}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
        
        {/* Bypass Notification Banner */}
        {BYPASS_OFFER_LIMITS && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Limited Time Promotion</h3>
              <p className="text-green-700 dark:text-green-400 text-sm">
                We're temporarily allowing unlimited promo code submissions for all influencers. Keep adding offers with no limits!
              </p>
            </div>
          </div>
        )}
        
        {/* Subscription Status Card */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Subscription Status</h2>
                <p className="text-muted-foreground">
                  {subscribed 
                    ? `${subscriptionTier} plan • Renews: ${formatSubscriptionEndDate(subscriptionEnd)}`
                    : "Starter plan (Free)"
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Offers</div>
                  <div className="font-semibold">
                    {promoCodes.length} / {BYPASS_OFFER_LIMITS ? "Unlimited" : maxOffers}
                  </div>
                </div>
                
                {subscribed ? (
                  <Button 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className="whitespace-nowrap"
                    onClick={() => navigate("/pricing")}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="promocodes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
            <TabsTrigger value="add">Add New Promo Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="promocodes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Promo Codes</span>
                  {/* Only show badge legend if there are expired or expiring soon codes */}
                  {(hasExpiredCodes || hasExpiringSoonCodes) && (
                    <div className="flex gap-2 text-sm font-normal">
                      {hasExpiredCodes && (
                        <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400">
                          Expired
                        </Badge>
                      )}
                      {hasExpiringSoonCodes && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPromoCodes ? (
                  <div className="text-center py-4">Loading promo codes...</div>
                ) : promoCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Affiliate Link</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodes.map((code) => (
                          <TableRow key={code.id} className={
                            isExpired(code.expiration_date) 
                              ? "bg-red-50 dark:bg-red-950/10" 
                              : isExpiringSoon(code.expiration_date)
                              ? "bg-yellow-50 dark:bg-yellow-950/10"
                              : ""
                          }>
                            {editingPromoCodeId === code.id ? (
                              <TableCell colSpan={7}>
                                <PromoCodeEditor 
                                  promoCode={code} 
                                  onSave={handlePromoCodeUpdated} 
                                  onCancel={() => setEditingPromoCodeId(null)} 
                                />
                              </TableCell>
                            ) : (
                              <>
                                <TableCell className="font-medium">{code.brand_name}</TableCell>
                                <TableCell className="font-mono">{code.promo_code}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 bg-brand-light dark:bg-brand-dark rounded-full text-xs">
                                    {code.category}
                                  </span>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">{code.description}</TableCell>
                                <TableCell>
                                  {code.expiration_date 
                                    ? (
                                      <div className="flex items-center gap-2">
                                        <span>{new Date(code.expiration_date).toLocaleDateString()}</span>
                                        {isExpired(code.expiration_date) && (
                                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                                        )}
                                        {isExpiringSoon(code.expiration_date) && !isExpired(code.expiration_date) && (
                                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 text-xs">
                                            Soon
                                          </Badge>
                                        )}
                                      </div>
                                    )
                                    : "No expiration"
                                  }
                                </TableCell>
                                <TableCell>
                                  {code.affiliate_link ? (
                                    <a 
                                      href={code.affiliate_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-brand-green hover:underline truncate max-w-[150px] inline-block"
                                    >
                                      {code.affiliate_link}
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setEditingPromoCodeId(code.id)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      onClick={() => handleDeletePromoCode(code.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-md bg-muted/20">
                    You haven't added any promo codes yet.
                  </div>
                )}
              </CardContent>
            </Card>
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
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? Your plan benefits will continue until the end of the current billing period.
              {promoCodes.length > 1 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
                  You currently have {promoCodes.length} promo codes. You can only cancel your subscription if you have 1 or fewer promo codes active. Please remove your additional promo codes first.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelSubscription();
              }}
              disabled={isCanceling || promoCodes.length > 1}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? "Canceling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InfluencerDashboard;
