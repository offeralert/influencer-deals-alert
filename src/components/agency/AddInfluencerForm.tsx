
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

interface AddInfluencerFormProps {
  onSuccess?: () => void;
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

  const addInfluencerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, create a profile for the influencer
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // Generate a UUID for the new influencer
          full_name: data.full_name,
          username: data.username,
          is_influencer: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Then, create the agency-influencer relationship
      const { error: relationshipError } = await supabase
        .from('agency_influencers')
        .insert({
          agency_id: user.id,
          influencer_id: profile.id,
          managed_by_agency: true,
        });

      if (relationshipError) throw relationshipError;

      return profile;
    },
    onSuccess: () => {
      toast({
        title: "Influencer Added Successfully",
        description: "The new influencer has been added to your agency.",
      });
      
      // Reset form
      setFormData({
        full_name: '',
        username: '',
        email: '',
        bio: '',
      });
      
      // Refresh the managed influencers list
      queryClient.invalidateQueries({ queryKey: ['managed-influencers'] });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error adding influencer:', error);
      toast({
        title: "Error Adding Influencer",
        description: error.message || "Failed to add influencer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim() || !formData.username.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the full name and username.",
        variant: "destructive",
      });
      return;
    }

    addInfluencerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Influencer</CardTitle>
        <CardDescription>
          Create a new influencer profile for your agency to manage.
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
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
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

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-600/90"
              disabled={addInfluencerMutation.isPending}
            >
              {addInfluencerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Influencer
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
  );
};

export default AddInfluencerForm;
