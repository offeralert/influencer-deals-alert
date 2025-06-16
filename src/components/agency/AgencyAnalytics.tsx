
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

const AgencyAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['agency-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get managed influencers count
      const { data: influencers, error: influencersError } = await supabase
        .from('agency_influencers')
        .select('influencer_id')
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (influencersError) throw influencersError;

      const influencerIds = influencers?.map(inf => inf.influencer_id) || [];

      // Get promo codes count for managed influencers
      const { data: promoCodes, error: promoError } = await supabase
        .from('promo_codes')
        .select('id, brand_name, category, created_at')
        .in('influencer_id', influencerIds);

      if (promoError) throw promoError;

      // Calculate analytics
      const totalInfluencers = influencers?.length || 0;
      const totalPromoCodes = promoCodes?.length || 0;
      
      // Group by categories
      const categoryCounts: Record<string, number> = {};
      promoCodes?.forEach(code => {
        categoryCounts[code.category] = (categoryCounts[code.category] || 0) + 1;
      });

      // Group by brands
      const brandCounts: Record<string, number> = {};
      promoCodes?.forEach(code => {
        brandCounts[code.brand_name] = (brandCounts[code.brand_name] || 0) + 1;
      });

      return {
        totalInfluencers,
        totalPromoCodes,
        categoryCounts,
        brandCounts,
        recentPromoCodes: promoCodes?.slice(-5) || [],
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agency Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const topCategories = analytics?.categoryCounts 
    ? Object.entries(analytics.categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    : [];

  const topBrands = analytics?.brandCounts 
    ? Object.entries(analytics.brandCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalInfluencers || 0}</div>
            <p className="text-xs text-muted-foreground">Managed by your agency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promo Codes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPromoCodes || 0}</div>
            <p className="text-xs text-muted-foreground">Across all influencers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategories.length}</div>
            <p className="text-xs text-muted-foreground">Different categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Brands</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topBrands.length}</div>
            <p className="text-xs text-muted-foreground">Different brands</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most popular categories by promo code count</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-sm text-muted-foreground">{count} codes</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No promo codes yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Top Brands</CardTitle>
            <CardDescription>Most active brand partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {topBrands.length > 0 ? (
              <div className="space-y-3">
                {topBrands.map(([brand, count]) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{brand}</span>
                    <span className="text-sm text-muted-foreground">{count} codes</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No brand partnerships yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Promo Codes</CardTitle>
          <CardDescription>Latest promo codes from your managed influencers</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.recentPromoCodes && analytics.recentPromoCodes.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentPromoCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{code.brand_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{code.category}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(code.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No promo codes yet. Start by adding influencers to your agency.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyAnalytics;
