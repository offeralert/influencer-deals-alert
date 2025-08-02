import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface PromoCodeWithInfluencer {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  brand_url: string;
  affiliate_link: string;
  category: string;
  expiration_date: string | null;
  created_at: string;
  influencer_profile: {
    full_name: string;
    username: string;
  };
}

const AllPromoCodesView = () => {
  const { user } = useAuth();

  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['agency-all-promo-codes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          brand_url,
          affiliate_link,
          category,
          expiration_date,
          created_at,
          influencer_profile:profiles!influencer_id(full_name, username)
        `)
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCodeWithInfluencer[];
    },
    enabled: !!user?.id,
  });

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const isExpiringSoon = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    const expiryDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>Loading promo codes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Agency Promo Codes</CardTitle>
        <CardDescription>
          View all promo codes created across your managed influencers ({promoCodes.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            After adding a promo code, it might not show up immediately as our systems validate it in our dashboard. To speed up the process, clear your browser cache and refresh the page.
          </AlertDescription>
        </Alert>

        {promoCodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No promo codes have been created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell className="font-medium">
                      {promoCode.brand_name}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {promoCode.promo_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promoCode.influencer_profile?.full_name}</div>
                        <div className="text-sm text-muted-foreground">@{promoCode.influencer_profile?.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {promoCode.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isExpired(promoCode.expiration_date) ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Expired
                        </span>
                      ) : isExpiringSoon(promoCode.expiration_date) ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Expiring Soon
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(promoCode.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {promoCode.brand_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(promoCode.brand_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {promoCode.affiliate_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(promoCode.affiliate_link, '_blank')}
                          >
                            Visit Store
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllPromoCodesView;