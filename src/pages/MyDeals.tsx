
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyDeals = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("following");
  
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

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Deals</h1>
      
      <Tabs defaultValue="following" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="following">
          <div className="text-center py-16 bg-brand-paleGreen bg-opacity-50 rounded-lg">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No followed influencers yet</h3>
            <p className="text-gray-500 mb-4">
              Follow your favorite influencers to see their deals here
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate("/explore")}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              Explore Influencers
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="text-center py-16 bg-brand-paleGreen bg-opacity-50 rounded-lg">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No saved deals yet</h3>
            <p className="text-gray-500 mb-4">
              Save deals to access them quickly later
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate("/explore")}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              Explore Deals
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyDeals;
