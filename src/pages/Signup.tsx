
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfluencerSignupForm from "@/components/auth/InfluencerSignupForm";
import AgencySignupForm from "@/components/auth/AgencySignupForm";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("influencer");

  useEffect(() => {
    if (searchParams.get("tab") === "agency") {
      setActiveTab("agency");
    }
  }, [searchParams]);

  const renderBenefits = () => {
    if (activeTab === "influencer") {
      return (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-foreground mb-2">For Influencers:</h3>
          <p>Perfect for content creators, social media influencers, and individuals who want to promote brands and earn commissions through exclusive promo codes and affiliate links.</p>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-foreground mb-2">For Agencies:</h3>
        <p className="mb-2">
          Ideal for marketing agencies and businesses that manage multiple influencers and want to streamline promo code management.
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Choose how you want to join Offer Alert
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="influencer" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="influencer">Sign up as an Influencer</TabsTrigger>
            <TabsTrigger value="agency">Sign up as an Agency</TabsTrigger>
          </TabsList>
          
          {renderBenefits()}
          
          <TabsContent value="influencer">
            <InfluencerSignupForm />
          </TabsContent>
          
          <TabsContent value="agency">
            <AgencySignupForm />
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-center border-t pt-4 mt-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-brand-green hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
