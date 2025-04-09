
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormData {
  fullName: string;
  username: string;
  avatarUrl: string;
}

export const useProfileForm = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    username: "",
    avatarUrl: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleAvatarChange = (file: File | null, preview: string | null) => {
    setAvatar(file);
    setPreviewImage(preview);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      let avatarUrl = formData.avatarUrl;

      // Upload avatar if a new one was selected
      if (avatar) {
        // Create a file path that includes the user ID as a folder
        // This matches the structure expected by our RLS policies
        const filePath = `${user.id}/${Date.now()}-${avatar.name.replace(/\s+/g, '-')}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, {
            upsert: true,
          });

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

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
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh the profile in the auth context to update UI across the site
      refreshProfile();
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    previewImage,
    isSaving,
    handleChange,
    handleAvatarChange,
    handleSubmit,
    user,
    profile,
  };
};
