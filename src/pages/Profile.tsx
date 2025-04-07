
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Profile = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username || user.email} />
              <AvatarFallback>
                {profile?.username?.substring(0, 2).toUpperCase() || 
                 user.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-2xl">{profile?.full_name || 'User'}</CardTitle>
              <div className="text-sm text-muted-foreground">@{profile?.username || user.email?.split('@')[0]}</div>
              <div className="text-sm">{user.email}</div>
              {profile?.pending_influencer && !profile?.is_influencer && (
                <div className="text-amber-500 font-medium">Influencer Application Pending</div>
              )}
              {profile?.is_influencer && (
                <div className="text-brand-green font-medium">Influencer Account</div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  {profile?.is_influencer && (
                    <div className="text-brand-green font-medium">Influencer Account</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <a href="/edit-profile">Edit Profile</a>
              </Button>
              <Button variant="destructive" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
