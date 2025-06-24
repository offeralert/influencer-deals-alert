
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Copy, Save } from "lucide-react";
import { toast } from "sonner";

interface EditInfluencerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: {
    id: string;
    full_name?: string;
    username?: string;
    email?: string;
  };
  relationshipId: string;
}

const STANDARD_PASSWORD = "Influencer123!";

const EditInfluencerDialog = ({ 
  isOpen, 
  onClose, 
  influencer, 
  relationshipId 
}: EditInfluencerDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: influencer.full_name || "",
    username: influencer.username || "",
    email: influencer.email || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
        })
        .eq('id', influencer.id);

      if (profileError) throw profileError;

      // Update auth user email if changed
      if (formData.email !== influencer.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          influencer.id,
          { email: formData.email }
        );
        
        if (emailError) {
          console.warn('Could not update email via admin API:', emailError);
          // This might fail due to permissions, but profile update succeeded
        }
      }

      // Update the temporary password in agency_influencers table
      const { error: passwordError } = await supabase
        .from('agency_influencers')
        .update({
          temporary_password: STANDARD_PASSWORD
        })
        .eq('id', relationshipId);

      if (passwordError) throw passwordError;

      toast.success("Influencer details updated successfully!");
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['managed-influencers'] });
      
      onClose();
    } catch (error) {
      console.error("Error updating influencer:", error);
      toast.error("Failed to update influencer details");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Influencer Details</DialogTitle>
          <DialogDescription>
            Update the influencer's profile information and view their login credentials.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Standard Password</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={STANDARD_PASSWORD}
                readOnly
                className="bg-gray-50"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(STANDARD_PASSWORD, "Password")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is the standard password used for all agency-managed influencers.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInfluencerDialog;
