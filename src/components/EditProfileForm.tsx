
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProfileAvatarUploader from "./profile/ProfileAvatarUploader";
import ProfileDetailsForm from "./profile/ProfileDetailsForm";
import { useProfileForm } from "./profile/useProfileForm";

const EditProfileForm = () => {
  const {
    formData,
    previewImage,
    isSaving,
    handleChange,
    handleAvatarChange,
    handleSubmit,
    user,
    profile,
  } = useProfileForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProfileAvatarUploader
            initialAvatarUrl={previewImage}
            username={profile?.username}
            email={user?.email}
            disabled={isSaving}
            onAvatarChange={handleAvatarChange}
          />
          
          <ProfileDetailsForm
            fullName={formData.fullName}
            username={formData.username}
            disabled={isSaving}
            onChange={handleChange}
          />
          
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
