
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const PromoCodesList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Promo Codes</CardTitle>
        <CardDescription>
          Manage and track your promotional codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first promo code to share with your audience.
          </p>
          <Button>Add Your First Promo Code</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodesList;
