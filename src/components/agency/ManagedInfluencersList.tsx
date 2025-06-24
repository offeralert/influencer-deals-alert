import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Copy, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";
import { useState } from "react";
import { toast } from "sonner";
import EditInfluencerModal from "./EditInfluencerModal";

const ManagedInfluencersList = () => {
  const { user } = useAuth();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editingInfluencer, setEditingInfluencer] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: managedInfluencers, isLoading, error } = useQuery({
    queryKey: ['managed-influencers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('agency_influencers')
        .select(`
          id,
          created_at,
          managed_by_agency,
          temporary_password,
          influencer_profile:profiles!influencer_id (
            id,
            full_name,
            username,
            avatar_url,
            is_influencer,
            is_featured
          )
        `)
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: promoCodeCounts } = useQuery({
    queryKey: ['influencer-promo-counts', managedInfluencers?.map(inf => inf.influencer_profile?.id)],
    queryFn: async () => {
      if (!managedInfluencers?.length) return {};

      const influencerIds = managedInfluencers
        .map(inf => inf.influencer_profile?.id)
        .filter(Boolean);

      if (influencerIds.length === 0) return {};

      const { data, error } = await supabase
        .from('promo_codes')
        .select('influencer_id')
        .in('influencer_id', influencerIds);

      if (error) throw error;

      // Count promo codes per influencer
      const counts: Record<string, number> = {};
      data?.forEach(pc => {
        counts[pc.influencer_id] = (counts[pc.influencer_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!managedInfluencers?.length,
  });

  const togglePasswordVisibility = (relationshipId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(relationshipId)) {
        newSet.delete(relationshipId);
      } else {
        newSet.add(relationshipId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEditInfluencer = (relationship: any) => {
    setEditingInfluencer(relationship);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingInfluencer(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Managed Influencers</CardTitle>
          <CardDescription>Loading your influencer network...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Managed Influencers</CardTitle>
          <CardDescription>Error loading influencers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load influencers. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!managedInfluencers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Managed Influencers</CardTitle>
          <CardDescription>
            You haven't added any influencers to your agency yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Start building your influencer network by adding your first influencer.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-600/90">
              <Users className="mr-2 h-4 w-4" />
              Add Your First Influencer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Managed Influencers</CardTitle>
          <CardDescription>
            {managedInfluencers.length} influencer{managedInfluencers.length !== 1 ? 's' : ''} in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedInfluencers.map((relationship) => {
              const influencer = relationship.influencer_profile;
              const promoCount = promoCodeCounts?.[influencer?.id || ''] || 0;
              const avatarUrl = getAvatarUrl(influencer?.avatar_url);
              const isPasswordVisible = visiblePasswords.has(relationship.id);

              return (
                <Card key={relationship.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={avatarUrl || undefined} alt={influencer?.full_name || ''} />
                        <AvatarFallback>
                          <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {influencer?.full_name || influencer?.username || 'Unknown'}
                        </h3>
                        {influencer?.username && (
                          <p className="text-sm text-muted-foreground">
                            @{influencer.username}
                          </p>
                        )}
                        
                        {relationship.temporary_password && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Temp Password:</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => togglePasswordVisibility(relationship.id)}
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(relationship.temporary_password, 'Password')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <code className="text-xs font-mono">
                              {isPasswordVisible ? relationship.temporary_password : '••••••••••'}
                            </code>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {promoCount} promo code{promoCount !== 1 ? 's' : ''}
                          </Badge>
                          {influencer?.is_influencer && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          {influencer?.is_featured && (
                            <Badge variant="default" className="text-xs bg-purple-600">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/manage-influencer-codes/${influencer?.id}`}>
                              <Plus className="h-3 w-3 mr-1" />
                              Manage Codes
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditInfluencer(relationship)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EditInfluencerModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        influencerRelationship={editingInfluencer}
      />
    </>
  );
};

export default ManagedInfluencersList;
