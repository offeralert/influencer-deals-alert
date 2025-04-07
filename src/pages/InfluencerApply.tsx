
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PromoCodeEntry {
  id: string;
  brandName: string;
  promoCode: string;
  expirationDate: string;
  affiliateLink: string;
  description: string;
}

const InfluencerApply = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [socialHandle, setSocialHandle] = useState(profile?.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for promo code entries
  const [promoEntries, setPromoEntries] = useState<PromoCodeEntry[]>([
    {
      id: "1",
      brandName: "",
      promoCode: "",
      expirationDate: "",
      affiliateLink: "",
      description: "",
    }
  ]);

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

  const addPromoEntry = () => {
    setPromoEntries([
      ...promoEntries,
      {
        id: `${promoEntries.length + 1}`,
        brandName: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: ""
      }
    ]);
  };

  const updatePromoEntry = (id: string, field: keyof PromoCodeEntry, value: string) => {
    setPromoEntries(
      promoEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removePromoEntry = (id: string) => {
    if (promoEntries.length > 1) {
      setPromoEntries(promoEntries.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error("You must be logged in to apply");
        return;
      }

      // For now, this will just update the user profile to mark them as an influencer
      // In a real app, this would go through an approval process
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          username: socialHandle,
          is_influencer: true 
        })
        .eq('id', user.id);

      if (error) throw error;

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
            Share your details and promo codes to apply for an influencer account
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
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Promo Codes</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addPromoEntry}
                  className="text-brand-green border-brand-green hover:bg-brand-paleGreen hover:text-brand-green"
                >
                  Add More
                </Button>
              </div>
              
              {promoEntries.map((entry, index) => (
                <Card key={entry.id} className="mb-4 border-brand-paleGreen">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">Promo #{index + 1}</CardTitle>
                      {promoEntries.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => removePromoEntry(entry.id)}
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`brand-${entry.id}`}>Brand Name</Label>
                        <Input
                          id={`brand-${entry.id}`}
                          value={entry.brandName}
                          onChange={(e) => updatePromoEntry(entry.id, "brandName", e.target.value)}
                          placeholder="e.g. Nike, Amazon"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`code-${entry.id}`}>Promo Code</Label>
                        <Input
                          id={`code-${entry.id}`}
                          value={entry.promoCode}
                          onChange={(e) => updatePromoEntry(entry.id, "promoCode", e.target.value)}
                          placeholder="e.g. SAVE20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`expiry-${entry.id}`}>Expiration Date (Optional)</Label>
                        <Input
                          id={`expiry-${entry.id}`}
                          type="date"
                          value={entry.expirationDate}
                          onChange={(e) => updatePromoEntry(entry.id, "expirationDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`affiliate-${entry.id}`}>Affiliate Link (Optional)</Label>
                        <Input
                          id={`affiliate-${entry.id}`}
                          value={entry.affiliateLink}
                          onChange={(e) => updatePromoEntry(entry.id, "affiliateLink", e.target.value)}
                          placeholder="https://"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description-${entry.id}`}>Short Description</Label>
                      <Textarea
                        id={`description-${entry.id}`}
                        value={entry.description}
                        onChange={(e) => updatePromoEntry(entry.id, "description", e.target.value)}
                        placeholder="Briefly describe the offer (e.g. 20% off all items)"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
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
