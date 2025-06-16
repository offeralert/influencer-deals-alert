
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, BarChart3, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ManagedInfluencersList from "@/components/agency/ManagedInfluencersList";
import AddInfluencerForm from "@/components/agency/AddInfluencerForm";
import AgencyAnalytics from "@/components/agency/AgencyAnalytics";

const AgencyDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Check authentication and agency status
  useAuthGate({
    requireAuth: true,
    requireAgency: true,
    redirectTo: "/login"
  });

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
          <TabsTrigger value="influencers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Influencers
          </TabsTrigger>
          <TabsTrigger value="add-influencer" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Influencer
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Influencers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
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
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Across all influencers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clicks
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  This month
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers">
          <ManagedInfluencersList />
        </TabsContent>

        <TabsContent value="add-influencer">
          <AddInfluencerForm onSuccess={() => setActiveTab("influencers")} />
        </TabsContent>

        <TabsContent value="analytics">
          <AgencyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyDashboard;
