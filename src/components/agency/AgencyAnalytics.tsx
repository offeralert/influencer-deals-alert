
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

const AgencyAnalytics = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agency Performance Analytics</CardTitle>
          <CardDescription>
            Track performance across your managed influencer network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Total Influencers</span>
              </div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Managed accounts</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Total Clicks</span>
              </div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">Active Codes</span>
              </div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Live promotions</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-medium">This Month</span>
              </div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">New codes added</p>
            </div>
          </div>
          
          <div className="mt-6 text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Detailed analytics will be available once you start managing influencers and promo codes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyAnalytics;
