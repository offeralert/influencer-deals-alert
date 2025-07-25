
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  Settings,
  Plus,
  Share2,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import PromoCodesList from "@/components/influencer/PromoCodesList";
import AddPromoCodeForm from "@/components/influencer/AddPromoCodeForm";
import SocialMediaLinksForm from "@/components/influencer/SocialMediaLinksForm";
import { useInfluencerProfileById } from "@/hooks/useInfluencerProfileById";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("promo-codes");
  const [refreshKey, setRefreshKey] = useState(0);
  const managedInfluencerId = searchParams.get('influencer');
  
  // If this is an agency managing a specific influencer, show that context
  const isManagingInfluencer = !!managedInfluencerId;
  
  // Fetch managed influencer profile data
  const { influencer: managedInfluencer, loading: influencerLoading } = useInfluencerProfileById(managedInfluencerId);

  const handlePromoCodeAdded = () => {
    console.log("[DASHBOARD] Promo code added, refreshing lists");
    // Refresh the promo codes list
    setRefreshKey(prev => prev + 1);
    // Switch to the promo codes tab to show the new code
    setActiveTab("promo-codes");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {isManagingInfluencer && managedInfluencer ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={getAvatarUrl(managedInfluencer.avatar_url)} 
                  alt={managedInfluencer.full_name}
                />
                <AvatarFallback>
                  <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  Managing {managedInfluencer.full_name}
                </h1>
                <p className="text-muted-foreground">
                  @{managedInfluencer.username} • Manage this influencer's profile and promo codes
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isManagingInfluencer ? (
                influencerLoading ? "Loading Influencer..." : "Managing Influencer"
              ) : "Influencer Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {isManagingInfluencer 
                ? "Manage this influencer's profile and promo codes."
                : "Manage your profile and add promo codes."
              }
            </p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="promo-codes" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="add-promo-code" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Promo Code
          </TabsTrigger>
          <TabsTrigger value="social-media" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promo-codes">
          <PromoCodesList 
            key={refreshKey} 
            targetInfluencerId={managedInfluencerId}
          />
        </TabsContent>

        <TabsContent value="add-promo-code">
          <AddPromoCodeForm 
            onPromoCodeAdded={handlePromoCodeAdded} 
            targetInfluencerId={managedInfluencerId}
          />
        </TabsContent>

        <TabsContent value="social-media">
          <SocialMediaLinksForm />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerDashboard;
