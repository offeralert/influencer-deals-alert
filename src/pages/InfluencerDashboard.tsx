
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("promo-codes");
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePromoCodeAdded = () => {
    console.log("[DASHBOARD] Promo code added, refreshing lists");
    // Refresh the promo codes list
    setRefreshKey(prev => prev + 1);
    // Switch to the promo codes tab to show the new code
    setActiveTab("promo-codes");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile and add promo codes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
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

        <TabsContent value="promo-codes">
          <PromoCodesList key={refreshKey} />
        </TabsContent>

        <TabsContent value="add-promo-code">
          <AddPromoCodeForm onPromoCodeAdded={handlePromoCodeAdded} />
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
