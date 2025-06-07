
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { getAvatarUrl } from "@/utils/avatarUtils";

interface ProfileAvatarUploaderProps {
  initialAvatarUrl: string | null;
  username?: string;
  email?: string;
  disabled?: boolean;
  onAvatarChange: (file: File | null, previewUrl: string | null) => void;
}

const ProfileAvatarUploader = ({
  initialAvatarUrl,
  username,
  email,
  disabled = false,
  onAvatarChange,
}: ProfileAvatarUploaderProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialAvatarUrl);
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreviewImage(previewUrl);
      onAvatarChange(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const avatarUrl = getAvatarUrl(previewImage);

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl} alt="Profile" />
      </Avatar>
      
      <div className="flex flex-col items-center">
        <Label htmlFor="avatar" className="cursor-pointer text-brand-green hover:underline flex items-center gap-1">
          <Upload className="h-4 w-4" />
          {avatar ? "Change Selected Image" : "Upload Profile Picture"}
        </Label>
        <Input 
          id="avatar" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground mt-1">
          Recommended: Square image, 200x200px minimum
        </span>
      </div>
    </div>
  );
};

export default ProfileAvatarUploader;
