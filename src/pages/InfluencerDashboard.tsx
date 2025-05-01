
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PromoCodeForm from "@/components/PromoCodeForm";
import PromoCodeEditor from "@/components/PromoCodeEditor";
import { supabase } from "@/integrations/supabase/client";
import { syncUserDomainMap } from "@/utils/supabaseQueries";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
  category: string;
}

const InfluencerDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
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

      // Subscribe to changes in the promo_codes table
      const promoChangesChannel = supabase
        .channel('promo-code-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'promo_codes',
            filter: `influencer_id=eq.${user.id}`
          },
          async (payload) => {
            // Refresh local list
            fetchPromoCodes();
            
            // Sync user_domain_map when promo codes change
            if (payload.eventType === 'INSERT') {
              // New promo code added
              toast.info("Updating your followers' domain mappings...");
              const result = await syncUserDomainMap(user.id);
              if (result.success) {
                toast.success("Follower domain mappings updated successfully");
              }
            } else if (payload.eventType === 'DELETE') {
              // Promo code deleted
              toast.info("Updating your followers' domain mappings...");
              const result = await syncUserDomainMap(
                user.id,
                payload.old?.id,
                true
              );
              if (result.success) {
                toast.success("Follower domain mappings updated successfully");
              }
            } else if (payload.eventType === 'UPDATE') {
              // Promo code updated - check if affiliate link changed
              const oldLink = payload.old?.affiliate_link;
              const newLink = payload.new?.affiliate_link;
              
              if (oldLink !== newLink) {
                toast.info("Updating your followers' domain mappings...");
                const result = await syncUserDomainMap(user.id);
                if (result.success) {
                  toast.success("Follower domain mappings updated successfully");
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(promoChangesChannel);
      };
    }
  }, [user]);

  const fetchPromoCodes = async () => {
    if (!user) return;
    
    setLoadingPromoCodes(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('influencer_id', user.id)
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

  const handlePromoCodeAdded = async () => {
    fetchPromoCodes();
  };

  const handlePromoCodeUpdated = async () => {
    fetchPromoCodes();
    setEditingPromoCodeId(null);
  };

  // Handle manual deletion of promo code
  const handleDeletePromoCode = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete the promo code
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting promo code:", error);
        toast.error("Failed to delete promo code");
        return;
      }
      
      toast.success("Promo code deleted");
      
      // Fetch updated list
      fetchPromoCodes();
      
      // Update user_domain_map for all followers
      toast.info("Updating your followers' domain mappings...");
      const result = await syncUserDomainMap(user.id, id, true);
      if (result.success) {
        toast.success("Follower domain mappings updated successfully");
      }
    } catch (error) {
      console.error("Error in handleDeletePromoCode:", error);
      toast.error("An error occurred while deleting the promo code");
    }
  };

  // Handle expiry check - runs when dashboard loads to clean up expired offers
  useEffect(() => {
    if (user && promoCodes.length > 0) {
      const checkForExpiredCodes = async () => {
        const now = new Date();
        const expiredCodes = promoCodes.filter(code => {
          if (code.expiration_date) {
            const expiryDate = new Date(code.expiration_date);
            return expiryDate < now;
          }
          return false;
        });
        
        if (expiredCodes.length > 0) {
          console.log(`Found ${expiredCodes.length} expired promo codes`);
          
          // Update domain mappings for expired codes
          toast.info(`Updating domain mappings for ${expiredCodes.length} expired promo codes...`);
          const result = await syncUserDomainMap(user.id);
          if (result.success) {
            toast.success("Domain mappings updated for expired promo codes");
          }
        }
      };
      
      checkForExpiredCodes();
    }
  }, [user, promoCodes]);

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
        
        <Tabs defaultValue="promocodes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
            <TabsTrigger value="add">Add New Promo Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="promocodes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Promo Codes</span>
                </CardTitle>
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
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Affiliate Link</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodes.map((code) => (
                          <TableRow key={code.id} className={
                            code.expiration_date && new Date(code.expiration_date) < new Date() 
                              ? "bg-red-50 dark:bg-red-950/10" 
                              : ""
                          }>
                            {editingPromoCodeId === code.id ? (
                              <TableCell colSpan={7}>
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
                                <TableCell>
                                  <span className="px-2 py-1 bg-brand-light dark:bg-brand-dark rounded-full text-xs">
                                    {code.category}
                                  </span>
                                </TableCell>
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
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setEditingPromoCodeId(code.id)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      onClick={() => handleDeletePromoCode(code.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
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
