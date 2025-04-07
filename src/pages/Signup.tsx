
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import UserSignupForm from "@/components/auth/UserSignupForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfluencerApplicationForm from "@/components/auth/InfluencerApplicationForm";

const Signup = () => {
  const [activeTab, setActiveTab] = useState("user");

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
            <TabsTrigger value="influencer">Apply as an Influencer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <UserSignupForm />
          </TabsContent>
          
          <TabsContent value="influencer">
            <InfluencerApplicationForm />
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
