
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CATEGORIES = [
  "Fashion",
  "Fitness",
  "Food",
  "Tech",
  "Home",
  "Jewelry",
  "Travel",
  "Beauty"
];

const InfluencerApply = () => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [socialHandle, setSocialHandle] = useState(profile?.username || "");
  const [category, setCategory] = useState(profile?.category || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("You must be logged in to apply");
        return;
      }

      if (!category) {
        toast.error("Please select your primary content category");
        return;
      }

      // Update user profile to mark them as an influencer
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          username: socialHandle,
          category: category,
          is_influencer: true 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile to update the UI
      await refreshProfile();

      toast.success("Application submitted successfully! You are now an influencer.");
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Become an Influencer</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Influencer Application</CardTitle>
          <CardDescription>
            Share your details to apply for an influencer account. You can add promo codes after your account is approved.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="socialHandle">Social Media Handle</Label>
                <Input
                  id="socialHandle"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@yourusername"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Primary Content Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  This helps users find your promo codes
                </p>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  We'll use your account email for communication
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-green hover:bg-brand-green/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InfluencerApply;
