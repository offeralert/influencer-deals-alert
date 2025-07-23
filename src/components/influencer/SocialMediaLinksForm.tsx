import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Instagram, Linkedin, Youtube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SocialMediaLinks {
  instagram_url: string;
  tiktok_url: string;
  x_url: string;
  youtube_url: string;
  linkedin_url: string;
}

const SocialMediaLinksForm = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SocialMediaLinks>({
    instagram_url: "",
    tiktok_url: "",
    x_url: "",
    youtube_url: "",
    linkedin_url: "",
  });

  useEffect(() => {
    if (profile) {
      const profileWithSocial = profile as any;
      setFormData({
        instagram_url: profileWithSocial.instagram_url || "",
        tiktok_url: profileWithSocial.tiktok_url || "",
        x_url: profileWithSocial.x_url || "",
        youtube_url: profileWithSocial.youtube_url || "",
        linkedin_url: profileWithSocial.linkedin_url || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          instagram_url: formData.instagram_url || null,
          tiktok_url: formData.tiktok_url || null,
          x_url: formData.x_url || null,
          youtube_url: formData.youtube_url || null,
          linkedin_url: formData.linkedin_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh the profile in the auth context
      refreshProfile();
      
      toast.success("Social media links updated successfully");
    } catch (error) {
      console.error("Error updating social media links:", error);
      toast.error("Failed to update social media links");
    } finally {
      setIsSaving(false);
    }
  };

  const socialPlatforms = [
    {
      name: "instagram_url",
      label: "Instagram",
      placeholder: "https://instagram.com/yourusername",
      icon: Instagram,
    },
    {
      name: "tiktok_url",
      label: "TikTok",
      placeholder: "https://tiktok.com/@yourusername",
      icon: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.321 5.562c-.756-.466-1.35-1.143-1.691-1.932l-.341-.002c-.084-.002-.168-.003-.252-.005-.025 0-.049 0-.074.001H14.25v11.172c0 2.414-1.961 4.375-4.375 4.375S5.5 17.209 5.5 14.795s1.961-4.375 4.375-4.375c.24 0 .475.02.705.058V7.422c-.228-.024-.46-.037-.705-.037C5.184 7.385 1.5 11.068 1.5 15.75s3.684 8.365 8.375 8.365 8.375-3.683 8.375-8.365V8.689c1.486 1.067 3.315 1.697 5.295 1.697v-3.055c-1.555 0-2.947-.623-3.981-1.633l-.243-.236z"/>
        </svg>
      ),
    },
    {
      name: "x_url",
      label: "X (Twitter)",
      placeholder: "https://x.com/yourusername",
      icon: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: "youtube_url",
      label: "YouTube",
      placeholder: "https://youtube.com/@yourusername",
      icon: Youtube,
    },
    {
      name: "linkedin_url",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/in/yourusername",
      icon: Linkedin,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add your social media profiles to display on your influencer page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <div key={platform.name} className="space-y-2">
                <Label htmlFor={platform.name} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {platform.label}
                </Label>
                <Input
                  id={platform.name}
                  name={platform.name}
                  type="url"
                  value={formData[platform.name as keyof SocialMediaLinks]}
                  onChange={handleChange}
                  placeholder={platform.placeholder}
                  disabled={isSaving}
                />
              </div>
            );
          })}
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Social Media Links"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SocialMediaLinksForm;