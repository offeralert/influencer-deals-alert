
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAgencySubscription } from "@/hooks/useAgencySubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, BarChart3, Crown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ManagedInfluencersList from "@/components/agency/ManagedInfluencersList";
import AddInfluencerForm from "@/components/agency/AddInfluencerForm";

const AgencyDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    maxOffers,
    totalPromoCodesUsed,
    isLoading: subscriptionLoading,
    bypassOfferLimits,
    refresh: refreshSubscription,
    createCheckoutSession,
    openCustomerPortal,
    error: subscriptionError
  } = useAgencySubscription();
  
  // Check authentication and agency status
  useAuthGate({
    requireAuth: true,
    requireAgency: true,
    redirectTo: "/login"
  });

  // Query to count managed influencers
  const { data: influencerCount = 0 } = useQuery({
    queryKey: ['agency-influencer-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from('agency_influencers')
        .select('id', { count: 'exact' })
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id,
  });

  // Handle subscription upgrade
  const handleUpgrade = async (planType: string) => {
    try {
      const checkoutUrl = await createCheckoutSession(planType as any);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    }
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    try {
      const portalUrl = await openCustomerPortal();
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  // Calculate if user is approaching or over limit
  const isApproachingLimit = !bypassOfferLimits && maxOffers !== Infinity && totalPromoCodesUsed >= maxOffers * 0.8;
  const isOverLimit = !bypassOfferLimits && maxOffers !== Infinity && totalPromoCodesUsed >= maxOffers;

  // Don't render if not an agency
  if (!profile?.is_agency) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          This page is only accessible to agency accounts.
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agency Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your influencers and track performance across your network.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="influencers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Influencers
          </TabsTrigger>
          <TabsTrigger value="add-influencer" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Influencer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Status Alert */}
          {(isApproachingLimit || isOverLimit) && (
            <Card className={`border-2 ${isOverLimit ? 'border-red-500' : 'border-yellow-500'}`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertTriangle className={`h-5 w-5 mr-2 ${isOverLimit ? 'text-red-500' : 'text-yellow-500'}`} />
                <CardTitle className="text-sm font-medium">
                  {isOverLimit ? 'Promo Code Limit Exceeded' : 'Approaching Promo Code Limit'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {isOverLimit 
                    ? `You've reached your limit of ${maxOffers} promo codes with ${totalPromoCodesUsed} active codes. Consider upgrading your plan.`
                    : `You're using ${totalPromoCodesUsed} of ${maxOffers} allowed promo codes. Consider upgrading before reaching the limit.`
                  }
                </p>
                <Button 
                  onClick={() => setActiveTab("subscription")}
                  variant={isOverLimit ? "destructive" : "default"}
                  size="sm"
                >
                  {isOverLimit ? "Upgrade Now" : "View Plans"}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Influencers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{influencerCount}</div>
                <p className="text-xs text-muted-foreground">
                  Managed influencers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Promo Codes
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPromoCodesUsed}</div>
                <p className="text-xs text-muted-foreground">
                  Across all influencers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Plan
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionTier}</div>
                <p className="text-xs text-muted-foreground">
                  {bypassOfferLimits ? "Unlimited" : `${totalPromoCodesUsed}/${maxOffers === Infinity ? "∞" : maxOffers} codes used`}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with managing your influencer network
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="bg-purple-600 hover:bg-purple-600/90" 
                onClick={() => setActiveTab("add-influencer")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Influencer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("influencers")}
              >
                <Users className="mr-2 h-4 w-4" />
                View All Influencers
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("subscription")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Agency Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and promo code limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Current Plan</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">{subscriptionTier}</div>
                    <div className="text-sm text-muted-foreground">
                      {subscribed ? "Active subscription" : "Free plan"}
                    </div>
                    {subscriptionEnd && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Renews: {new Date(subscriptionEnd).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Usage</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {totalPromoCodesUsed}
                      {!bypassOfferLimits && maxOffers !== Infinity && (
                        <span className="text-lg text-muted-foreground">
                          /{maxOffers}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bypassOfferLimits ? "Unlimited promo codes" : "Promo codes used"}
                    </div>
                    {!bypassOfferLimits && maxOffers !== Infinity && (
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            isOverLimit ? 'bg-red-500' : 
                            isApproachingLimit ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((totalPromoCodesUsed / maxOffers) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {subscribed ? (
                  <Button onClick={handleManageSubscription} variant="outline">
                    Manage Subscription
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => handleUpgrade("Boost")} className="bg-blue-600 hover:bg-blue-700">
                      Upgrade to Boost ($5/mo)
                    </Button>
                    <Button onClick={() => handleUpgrade("Growth")} className="bg-green-600 hover:bg-green-700">
                      Upgrade to Growth ($12/mo)
                    </Button>
                    <Button onClick={() => handleUpgrade("Pro")} className="bg-purple-600 hover:bg-purple-700">
                      Upgrade to Pro ($20/mo)
                    </Button>
                  </>
                )}
                <Button 
                  onClick={refreshSubscription}
                  variant="ghost"
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? "Refreshing..." : "Refresh Status"}
                </Button>
              </div>

              {subscriptionError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  Error: {subscriptionError}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers">
          <ManagedInfluencersList />
        </TabsContent>

        <TabsContent value="add-influencer">
          <AddInfluencerForm onSuccess={() => setActiveTab("influencers")} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyDashboard;
