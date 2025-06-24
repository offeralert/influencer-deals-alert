
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import EditInfluencerDialog from "./EditInfluencerDialog";
import InfluencerCard from "./InfluencerCard";
import EmptyInfluencersState from "./EmptyInfluencersState";
import { useManagedInfluencers } from "./hooks/useManagedInfluencers";
import { usePromoCodeCounts } from "./hooks/usePromoCodeCounts";

const ManagedInfluencersList = () => {
  const [editingInfluencer, setEditingInfluencer] = useState<{
    influencer: any;
    relationshipId: string;
  } | null>(null);

  const { data: managedInfluencers, isLoading, error } = useManagedInfluencers();
  const { data: promoCodeCounts } = usePromoCodeCounts(managedInfluencers || []);

  const handleEditInfluencer = (influencer: any, relationshipId: string) => {
    setEditingInfluencer({ influencer, relationshipId });
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
    return <EmptyInfluencersState />;
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
              const promoCount = promoCodeCounts?.[relationship.influencer_profile?.id || ''] || 0;

              return (
                <InfluencerCard
                  key={relationship.id}
                  relationship={relationship}
                  promoCount={promoCount}
                  onEdit={handleEditInfluencer}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {editingInfluencer && (
        <EditInfluencerDialog
          isOpen={!!editingInfluencer}
          onClose={() => setEditingInfluencer(null)}
          influencer={editingInfluencer.influencer}
          relationshipId={editingInfluencer.relationshipId}
        />
      )}
    </>
  );
};

export default ManagedInfluencersList;
