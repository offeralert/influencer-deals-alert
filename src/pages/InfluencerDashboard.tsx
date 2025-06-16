import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import UpgradeDialog from "@/components/influencer/UpgradeDialog";
import PromoCodesList from "@/components/influencer/PromoCodesList";
import AddPromoCodeForm from "@/components/influencer/AddPromoCodeForm";

const InfluencerDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Check authentication and influencer status
  const { isLoading } = useAuthGate({
    requireAuth: true,
    requireInfluencer: true,
    redirectTo: "/login"
  });

  // Conditionally render content based on subscription status
  useEffect(() => {
    if (profile?.is_creditcard === false) {
      setShowUpgradeDialog(true);
    } else {
      setShowUpgradeDialog(false);
    }
  }, [profile?.is_creditcard]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile, track performance, and add promo codes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Promo Codes
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Across all platforms
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clicks
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Trending
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Promo codes this week
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with managing your influencer profile
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
          <PromoCodesList />
        </TabsContent>

        <TabsContent value="add-promo-code">
          <AddPromoCodeForm />
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

      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      />
    </div>
  );
};

export default InfluencerDashboard;
