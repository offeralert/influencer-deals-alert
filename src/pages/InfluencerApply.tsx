
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("influencer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Influencer form data
  const [influencerData, setInfluencerData] = useState({
    fullName: profile?.full_name || "",
    socialHandle: profile?.username || "",
    category: profile?.category || "",
  });

  // Agency form data
  const [agencyData, setAgencyData] = useState({
    agencyName: profile?.full_name || "",
    contactEmail: user?.email || "",
  });

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

  const handleInfluencerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("You must be logged in to apply");
        return;
      }

      if (!influencerData.category) {
        toast.error("Please select your primary content category");
        return;
      }

      // Update user profile to mark them as an influencer
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: influencerData.fullName,
          username: influencerData.socialHandle,
          category: influencerData.category,
          is_influencer: true 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile to update the UI
      await refreshProfile();

      toast.success("Application submitted successfully! You are now an influencer.");
      navigate("/");
    } catch (error) {
      console.error("Error submitting influencer application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("You must be logged in to apply");
        return;
      }

      // Update user profile to mark them as an agency
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: agencyData.agencyName,
          username: agencyData.agencyName.toLowerCase().replace(/\s+/g, '_'),
          is_agency: true 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile to update the UI
      await refreshProfile();

      toast.success("Application submitted successfully! You are now an agency.");
      navigate("/");
    } catch (error) {
      console.error("Error submitting agency application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Choose Your Role</h1>
      <p className="text-center text-muted-foreground mb-8">
        Please select whether you're joining as an influencer or an agency to complete your account setup.
      </p>
      
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="influencer" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="influencer">Apply as Influencer</TabsTrigger>
            <TabsTrigger value="agency">Apply as Agency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="influencer">
            <Card>
              <CardHeader>
                <CardTitle>Influencer Application</CardTitle>
                <CardDescription>
                  Share your details to set up your influencer account. You can add promo codes after your account is set up.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleInfluencerSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={influencerData.fullName}
                        onChange={(e) => setInfluencerData(prev => ({...prev, fullName: e.target.value}))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialHandle">Social Media Handle</Label>
                      <Input
                        id="socialHandle"
                        value={influencerData.socialHandle}
                        onChange={(e) => setInfluencerData(prev => ({...prev, socialHandle: e.target.value}))}
                        placeholder="@yourusername"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Primary Content Category</Label>
                      <Select
                        value={influencerData.category}
                        onValueChange={(value) => setInfluencerData(prev => ({...prev, category: value}))}
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
                    {isSubmitting ? "Setting up..." : "Become an Influencer"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="agency">
            <Card>
              <CardHeader>
                <CardTitle>Agency Application</CardTitle>
                <CardDescription>
                  Set up your agency account to manage multiple influencers and their promo codes.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleAgencySubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agencyName">Agency Name</Label>
                      <Input
                        id="agencyName"
                        value={agencyData.agencyName}
                        onChange={(e) => setAgencyData(prev => ({...prev, agencyName: e.target.value}))}
                        placeholder="Your agency name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={agencyData.contactEmail}
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
                    {isSubmitting ? "Setting up..." : "Become an Agency"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfluencerApply;
