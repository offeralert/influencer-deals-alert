
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BrandDeal {
  id: string;
  brand_name: string;
  promo_code: string;
  discount_amount?: string;
  affiliate_link?: string;
  influencer_name?: string;
  influencer_username?: string;
}

const Brands = () => {
  const [brands, setBrands] = useState<BrandDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          affiliate_link,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .order('brand_name');
      
      if (error) {
        console.error("Error fetching brands:", error);
        return;
      }
      
      // Transform data to include influencer details
      const transformedData: BrandDeal[] = data.map(item => ({
        id: item.id,
        brand_name: item.brand_name,
        promo_code: item.promo_code,
        discount_amount: item.description,
        affiliate_link: item.affiliate_link || '#',
        influencer_name: item.profiles?.full_name || 'Unknown',
        influencer_username: item.profiles?.username || 'unknown',
      }));
      
      setBrands(transformedData);
    } catch (error) {
      console.error("Error in fetchBrands:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Brands & Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8">No brand deals available at this time.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Influencer</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.brand_name}</TableCell>
                      <TableCell>
                        <span className="bg-brand-light dark:bg-brand-dark px-2 py-0.5 rounded font-mono">
                          {brand.promo_code}
                        </span>
                      </TableCell>
                      <TableCell>{brand.discount_amount}</TableCell>
                      <TableCell>@{brand.influencer_username}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <a href={brand.affiliate_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Visit
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Brands;
