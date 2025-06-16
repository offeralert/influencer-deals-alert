
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, AtSign, FileText } from "lucide-react";
import InfluencerCredentialsModal from "./InfluencerCredentialsModal";

interface AddInfluencerFormProps {
  onSuccess?: () => void;
}

interface InfluencerCredentials {
  id: string;
  email: string;
  temporary_password: string;
  full_name: string;
  username: string;
}

const AddInfluencerForm = ({ onSuccess }: AddInfluencerFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    bio: '',
  });

  const [credentials, setCredentials] = useState<InfluencerCredentials | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const addInfluencerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get the auth token for the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No valid session');

      // Call the edge function to create the influencer user
      const response = await fetch(
        `https://tfcnrglreufvmacvsaak.supabase.co/functions/v1/create-influencer-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            full_name: data.full_name,
            username: data.username,
            email: data.email,
            bio: data.bio,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create influencer');
      }

      return result.influencer;
    },
    onSuccess: (newInfluencer: InfluencerCredentials) => {
      toast({
        title: "Influencer Created Successfully",
        description: `${newInfluencer.full_name} has been added to your agency with login credentials.`,
      });
      
      // Reset form
      setFormData({
        full_name: '',
        username: '',
        email: '',
        bio: '',
      });
      
      // Show credentials modal
      setCredentials(newInfluencer);
      setShowCredentialsModal(true);
      
      // Refresh the managed influencers list
      queryClient.invalidateQueries({ queryKey: ['managed-influencers'] });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error adding influencer:', error);
      
      let errorMessage = "Failed to add influencer. Please try again.";
      
      if (error.message.includes("Email address is already in use")) {
        errorMessage = "This email address is already registered. Please use a different email.";
      } else if (error.message.includes("Username is already taken")) {
        errorMessage = "This username is already taken. Please choose a different username.";
      } else if (error.message.includes("Only agencies can create")) {
        errorMessage = "You must be an agency to create influencer accounts.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Adding Influencer",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the full name, username, and email.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    addInfluencerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCredentialsModalClose = () => {
    setShowCredentialsModal(false);
    setCredentials(null);
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Influencer</CardTitle>
          <CardDescription>
            Create a new influencer account with login credentials for your agency to manage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4" />
                  Username *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
              <p className="text-xs text-muted-foreground">
                This email will be used for the influencer's login credentials.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter a short bio for the influencer"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A complete user account will be created with temporary login credentials. 
                You'll receive the login details to share with the influencer after creation.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-600/90"
                disabled={addInfluencerMutation.isPending}
              >
                {addInfluencerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Influencer Account
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  full_name: '',
                  username: '',
                  email: '',
                  bio: '',
                })}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <InfluencerCredentialsModal
        open={showCredentialsModal}
        onClose={handleCredentialsModalClose}
        credentials={credentials}
      />
    </>
  );
};

export default AddInfluencerForm;
