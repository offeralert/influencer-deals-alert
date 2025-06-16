import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Edit, Trash } from "lucide-react";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";
import PromoCodeForm from "@/components/PromoCodeForm";
import PromoCodeEditor from "@/components/PromoCodeEditor";
import { toast } from "sonner";
import AgencyPromoCodeForm from "@/components/agency/AgencyPromoCodeForm";

const ManageInfluencerCodes = () => {
  const { influencerId } = useParams<{ influencerId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("codes");
  const [editingCode, setEditingCode] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Check authentication and agency status
  useAuthGate({
    requireAuth: true,
    requireAgency: true,
    redirectTo: "/login"
  });

  // Get influencer details
  const { data: influencer, isLoading: influencerLoading } = useQuery({
    queryKey: ['influencer-details', influencerId],
    queryFn: async () => {
      if (!influencerId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', influencerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!influencerId,
  });

  // Get promo codes for this influencer
  const { data: promoCodes, isLoading: codesLoading, refetch } = useQuery({
    queryKey: ['influencer-promo-codes', influencerId],
    queryFn: async () => {
      if (!influencerId) return [];

      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!influencerId,
  });

  // Verify agency manages this influencer
  const { data: canManage } = useQuery({
    queryKey: ['can-manage-influencer', user?.id, influencerId],
    queryFn: async () => {
      if (!user?.id || !influencerId) return false;

      const { data, error } = await supabase
        .from('agency_influencers')
        .select('id')
        .eq('agency_id', user.id)
        .eq('influencer_id', influencerId)
        .eq('managed_by_agency', true)
        .single();

      return !error && !!data;
    },
    enabled: !!user?.id && !!influencerId,
  });

  const handleDeleteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast.success("Promo code deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error("Failed to delete promo code");
    }
  };

  const handleAddCode = () => {
    refetch();
    setShowAddForm(false);
    setActiveTab("codes");
  };

  const handleEditCode = () => {
    refetch();
    setEditingCode(null);
  };

  if (influencerLoading || codesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to manage this influencer's codes.
              </p>
              <Button asChild>
                <Link to="/agency-dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(influencer?.avatar_url);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/agency-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agency Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || undefined} alt={influencer?.full_name || ''} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              Manage Codes for {influencer?.full_name || influencer?.username || 'Influencer'}
            </h1>
            <p className="text-muted-foreground">
              Add, edit, or delete promo codes for this influencer
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="codes">
            Promo Codes ({promoCodes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="add-code" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          {editingCode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Promo Code</CardTitle>
                <CardDescription>
                  Update the details for this promo code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromoCodeEditor
                  promoCode={editingCode}
                  onSave={handleEditCode}
                  onCancel={() => setEditingCode(null)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Promo Codes</CardTitle>
                <CardDescription>
                  Manage all promo codes for this influencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!promoCodes?.length ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No promo codes found for this influencer.
                    </p>
                    <Button onClick={() => setActiveTab("add-code")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promoCodes.map((code) => (
                      <Card key={code.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{code.brand_name}</h3>
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                                  {code.promo_code}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {code.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Category: {code.category}</span>
                                {code.expiration_date && (
                                  <span>Expires: {new Date(code.expiration_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCode(code)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this promo code?')) {
                                    handleDeleteCode(code.id);
                                  }
                                }}
                              >
                                <Trash className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add-code">
          <Card>
            <CardHeader>
              <CardTitle>Add New Promo Code</CardTitle>
              <CardDescription>
                Create a new promo code for {influencer?.full_name || influencer?.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgencyPromoCodeForm 
                influencerId={influencerId!}
                onPromoCodeAdded={handleAddCode}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageInfluencerCodes;
