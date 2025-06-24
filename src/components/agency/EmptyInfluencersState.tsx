
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const EmptyInfluencersState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Managed Influencers</CardTitle>
        <CardDescription>
          You haven't added any influencers to your agency yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Start building your influencer network by adding your first influencer.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-600/90">
            <Users className="mr-2 h-4 w-4" />
            Add Your First Influencer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyInfluencersState;
