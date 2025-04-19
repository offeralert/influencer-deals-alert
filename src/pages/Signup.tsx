
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSignupForm from "@/components/auth/UserSignupForm";
import InfluencerSignupForm from "@/components/auth/InfluencerSignupForm";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("user");

  useEffect(() => {
    if (searchParams.get("tab") === "influencer") {
      setActiveTab("influencer");
    }
  }, [searchParams]);

  const renderBenefits = () => {
    if (activeTab === "user") {
      return (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-foreground mb-2">Benefits of a User Account:</h3>
          <p>Follow your favorite influencers and get notified of exclusive offers while shopping online.</p>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-foreground mb-2">Benefits of an Influencer Account:</h3>
        <p className="mb-2">
          Promote your promo codes and affiliate links through our AI-powered notification system — boosting visibility and commissions.
        </p>
        <p>Plus, enjoy all the same benefits as users if you also want to save while shopping online!</p>
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
        
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="user">Sign up as a User</TabsTrigger>
            <TabsTrigger value="influencer">Sign up as an Influencer</TabsTrigger>
          </TabsList>
          
          {renderBenefits()}
          
          <TabsContent value="user">
            <UserSignupForm />
          </TabsContent>
          
          <TabsContent value="influencer">
            <InfluencerSignupForm />
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
