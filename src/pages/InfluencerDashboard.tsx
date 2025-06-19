
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Settings,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import PromoCodesList from "@/components/influencer/PromoCodesList";
import AddPromoCodeForm from "@/components/influencer/AddPromoCodeForm";
import { getPromoCodes } from "@/utils/supabaseQueries";

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [promoCodesCount, setPromoCodesCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Check authentication and influencer status
  const { isLoading } = useAuthGate({
    requireAuth: true,
    requireInfluencer: true,
    redirectTo: "/login"
  });

  // Fetch promo codes count
  useEffect(() => {
    const fetchPromoCodesCount = async () => {
      if (!user) return;
      
      setLoadingCount(true);
      try {
        const { count, error } = await getPromoCodes()
          .eq('influencer_id', user.id)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Error fetching promo codes count:", error);
          return;
        }
        
        setPromoCodesCount(count || 0);
      } catch (error) {
        console.error("Error in fetchPromoCodesCount:", error);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchPromoCodesCount();
  }, [user]);

  const refreshPromoCodesCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await getPromoCodes()
        .eq('influencer_id', user.id)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Error refreshing promo codes count:", error);
        return;
      }
      
      setPromoCodesCount(count || 0);
    } catch (error) {
      console.error("Error in refreshPromoCodesCount:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile and add promo codes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="promo-codes" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="add-promo-code" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Promo Code
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Promo Codes
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingCount ? "..." : promoCodesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active promo codes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with managing your promo codes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="bg-brand-green hover:bg-brand-green/90" 
                onClick={() => setActiveTab("add-promo-code")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Promo Code
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("promo-codes")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                View All Promo Codes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promo-codes">
          <PromoCodesList onPromoCodeUpdated={refreshPromoCodesCount} />
        </TabsContent>

        <TabsContent value="add-promo-code">
          <AddPromoCodeForm onPromoCodeAdded={refreshPromoCodesCount} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerDashboard;
