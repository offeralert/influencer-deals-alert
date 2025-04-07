
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";
import PromoCodeForm from "@/components/PromoCodeForm";
import PromoCodeEditor from "@/components/PromoCodeEditor";
import { supabase } from "@/integrations/supabase/client";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
}

const InfluencerDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [editingPromoCodeId, setEditingPromoCodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (!isLoading && user && !profile?.is_influencer) {
      navigate("/influencer-apply");
    }
  }, [user, isLoading, profile, navigate]);

  useEffect(() => {
    if (user) {
      fetchPromoCodes();
      fetchFollowerCount();
    }
  }, [user]);

  const fetchPromoCodes = async () => {
    if (!user) return;
    
    setLoadingPromoCodes(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
    } finally {
      setLoadingPromoCodes(false);
    }
  };

  const fetchFollowerCount = async () => {
    if (!user) return;
    
    // In a real application, you would have a followers table
    // For now, we'll use a placeholder count
    setFollowerCount(Math.floor(Math.random() * 1000));
  };

  const handlePromoCodeAdded = () => {
    fetchPromoCodes();
  };

  const handlePromoCodeUpdated = () => {
    fetchPromoCodes();
    setEditingPromoCodeId(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user || !profile?.is_influencer) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Influencer Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Follower Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{followerCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="promocodes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
            <TabsTrigger value="add">Add New Promo Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="promocodes">
            <Card>
              <CardHeader>
                <CardTitle>Current Promo Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPromoCodes ? (
                  <div className="text-center py-4">Loading promo codes...</div>
                ) : promoCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Affiliate Link</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodes.map((code) => (
                          <TableRow key={code.id}>
                            {editingPromoCodeId === code.id ? (
                              <TableCell colSpan={6}>
                                <PromoCodeEditor 
                                  promoCode={code} 
                                  onSave={handlePromoCodeUpdated} 
                                  onCancel={() => setEditingPromoCodeId(null)} 
                                />
                              </TableCell>
                            ) : (
                              <>
                                <TableCell className="font-medium">{code.brand_name}</TableCell>
                                <TableCell className="font-mono">{code.promo_code}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{code.description}</TableCell>
                                <TableCell>
                                  {code.expiration_date 
                                    ? new Date(code.expiration_date).toLocaleDateString() 
                                    : "No expiration"}
                                </TableCell>
                                <TableCell>
                                  {code.affiliate_link ? (
                                    <a 
                                      href={code.affiliate_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-brand-green hover:underline truncate max-w-[150px] inline-block"
                                    >
                                      {code.affiliate_link}
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setEditingPromoCodeId(code.id)}
                                  >
                                    Edit
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-md bg-muted/20">
                    You haven't added any promo codes yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <PromoCodeForm onPromoCodeAdded={handlePromoCodeAdded} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
