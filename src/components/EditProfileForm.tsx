
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const EditProfileForm = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    avatarUrl: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        username: profile.username || "",
        avatarUrl: profile.avatar_url || "",
      });
      setPreviewImage(profile.avatar_url || null);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      let avatarUrl = formData.avatarUrl;

      // Upload avatar if a new one was selected
      if (avatar) {
        // Check if storage bucket exists or create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
        
        if (!avatarsBucketExists) {
          // Create avatars bucket
          await supabase.storage.createBucket('avatars', {
            public: true
          });
        }

        // Upload the avatar
        const fileName = `${user.id}-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar, {
            upsert: true,
          });

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        if (publicURL) {
          avatarUrl = publicURL.publicUrl;
        }
      }

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() // Convert Date to string
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewImage || ""} alt="Profile" />
              <AvatarFallback>
                {profile?.username?.substring(0, 2).toUpperCase() || 
                 user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-center">
              <Label htmlFor="avatar" className="cursor-pointer text-brand-green hover:underline">
                Change Profile Picture
              </Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isSaving}
              />
              <span className="text-xs text-muted-foreground mt-1">
                Recommended: Square image, 200x200px minimum
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
