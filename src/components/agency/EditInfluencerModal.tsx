
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Copy, RefreshCw, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

interface EditInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerRelationship: any;
}

interface FormData {
  full_name: string;
  username: string;
  is_featured: boolean;
  managed_by_agency: boolean;
}

const EditInfluencerModal = ({ isOpen, onClose, influencerRelationship }: EditInfluencerModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [tempPassword, setTempPassword] = useState(influencerRelationship?.temporary_password || "");
  
  const influencer = influencerRelationship?.influencer_profile;
  
  const form = useForm<FormData>({
    defaultValues: {
      full_name: influencer?.full_name || "",
      username: influencer?.username || "",
      is_featured: influencer?.is_featured || false,
      managed_by_agency: influencerRelationship?.managed_by_agency || true,
    },
  });

  // Generate a secure temporary password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const updateInfluencerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id || !influencer?.id) {
        throw new Error("Missing required IDs");
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username,
          is_featured: data.is_featured,
        })
        .eq('id', influencer.id);

      if (profileError) throw profileError;

      // Update agency_influencers table
      const { error: relationshipError } = await supabase
        .from('agency_influencers')
        .update({
          managed_by_agency: data.managed_by_agency,
          temporary_password: tempPassword,
        })
        .eq('agency_id', user.id)
        .eq('influencer_id', influencer.id);

      if (relationshipError) throw relationshipError;

      return data;
    },
    onSuccess: () => {
      toast.success("Influencer information updated successfully");
      queryClient.invalidateQueries({ queryKey: ['managed-influencers'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to update influencer: ${error.message}`);
    },
  });

  const regeneratePasswordMutation = useMutation({
    mutationFn: async () => {
      const newPassword = generatePassword();
      
      if (!user?.id || !influencer?.id) {
        throw new Error("Missing required IDs");
      }

      const { error } = await supabase
        .from('agency_influencers')
        .update({ temporary_password: newPassword })
        .eq('agency_id', user.id)
        .eq('influencer_id', influencer.id);

      if (error) throw error;
      return newPassword;
    },
    onSuccess: (newPassword) => {
      setTempPassword(newPassword);
      toast.success("New temporary password generated");
      queryClient.invalidateQueries({ queryKey: ['managed-influencers'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to regenerate password: ${error.message}`);
    },
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRegeneratePassword = () => {
    regeneratePasswordMutation.mutate();
  };

  const onSubmit = (data: FormData) => {
    updateInfluencerMutation.mutate(data);
  };

  if (!influencer) return null;

  const avatarUrl = getAvatarUrl(influencer.avatar_url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Influencer</DialogTitle>
          <DialogDescription>
            Update influencer information and manage access credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || undefined} alt={influencer.full_name || ''} />
            <AvatarFallback>
              <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{influencer.full_name || influencer.username || 'Unknown'}</h3>
            <p className="text-sm text-muted-foreground">@{influencer.username}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Influencer</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Display this influencer prominently on the platform
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managed_by_agency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Managed by Agency</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Agency has management rights over this influencer
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Temporary Login Password</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={isPasswordVisible ? "text" : "password"}
                    value={tempPassword}
                    readOnly
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(tempPassword, 'Password')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegeneratePassword}
                  disabled={regeneratePasswordMutation.isPending}
                >
                  {regeneratePasswordMutation.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password with the influencer so they can log in to their account.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateInfluencerMutation.isPending}
                className="bg-purple-600 hover:bg-purple-600/90"
              >
                {updateInfluencerMutation.isPending ? "Updating..." : "Update Influencer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInfluencerModal;
