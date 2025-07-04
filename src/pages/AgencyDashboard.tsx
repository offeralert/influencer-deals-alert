
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ManagedInfluencersList from "@/components/agency/ManagedInfluencersList";
import AddInfluencerForm from "@/components/agency/AddInfluencerForm";

const AgencyDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Query to count active promo codes across all managed influencers
  const { data: promoCodeCount = 0 } = useQuery({
    queryKey: ['agency-promo-code-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // First get all managed influencer IDs
      const { data: managedInfluencers, error: influencersError } = await supabase
        .from('agency_influencers')
        .select('influencer_id')
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (influencersError) throw influencersError;
      
      const influencerIds = managedInfluencers?.map(inf => inf.influencer_id) || [];
      
      if (influencerIds.length === 0) return 0;

      // Count promo codes for all managed influencers
      const { data, error } = await supabase
        .from('promo_codes')
        .select('id', { count: 'exact' })
        .in('influencer_id', influencerIds);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id,
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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
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
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="text-2xl font-bold">{promoCodeCount}</div>
                <p className="text-xs text-muted-foreground">
                  Across all influencers
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
      </Tabs>
    </div>
  );
};

export default AgencyDashboard;
