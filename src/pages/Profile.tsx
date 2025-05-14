import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PromoCodeForm from "@/components/PromoCodeForm";
import EditProfileForm from "@/components/EditProfileForm";
import { getAvatarUrl, getInitials } from "@/utils/avatarUtils";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Remove unused state
  // const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && profile?.is_influencer) {
      fetchPromoCodes();
    }
  }, [user, profile]);

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

  const handlePromoCodeAdded = () => {
    fetchPromoCodes();
  };

  // Remove unused function
  // const toggleEditProfile = () => {
  //   setEditingProfile(!editingProfile);
  //   if (editingProfile) {
  //     setActiveTab("profile");
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const initials = getInitials(profile?.username, user.email);
  const avatarUrl = getAvatarUrl(profile?.avatar_url);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={profile?.username || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-2xl">{profile?.full_name || 'User'}</CardTitle>
              <div className="text-sm text-muted-foreground">@{profile?.username || user.email?.split('@')[0]}</div>
              <div className="text-sm">{user.email}</div>
              {profile?.is_influencer && (
                <div className="text-brand-green font-medium">Influencer Account</div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {profile?.is_influencer ? (
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                  <TabsTrigger value="influencer">Influencer Dashboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Email:</span> {user.email}
                        </div>
                        <div>
                          <span className="font-medium">Account created:</span>{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Account type:</span>{" "}
                          {profile?.is_influencer ? "Influencer" : "User"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("edit")}>
                      Edit Profile
                    </Button>
                    <Button variant="destructive" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit">
                  <EditProfileForm />
                </TabsContent>
                
                <TabsContent value="influencer">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-medium mb-4">Your Promo Codes</h3>
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
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {promoCodes.map((code) => (
                                <TableRow key={code.id}>
                                  <TableCell className="font-medium">{code.brand_name}</TableCell>
                                  <TableCell className="font-mono">{code.promo_code}</TableCell>
                                  <TableCell>{code.description}</TableCell>
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
                                        className="text-brand-green hover:underline"
                                      >
                                        Link
                                      </a>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
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
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-medium mb-4">Add New Promo Code</h3>
                      <PromoCodeForm onPromoCodeAdded={handlePromoCodeAdded} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Email:</span> {user.email}
                        </div>
                        <div>
                          <span className="font-medium">Account created:</span>{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("edit")}>
                      Edit Profile
                    </Button>
                    <Button variant="destructive" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit">
                  <EditProfileForm />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
