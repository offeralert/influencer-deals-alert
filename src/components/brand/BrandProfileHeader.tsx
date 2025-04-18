
import { Card, CardContent } from "@/components/ui/card";

interface BrandProfileHeaderProps {
  brandName: string;
}

const BrandProfileHeader = ({ brandName }: BrandProfileHeaderProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold mb-1">{brandName}</h1>
          <p className="text-muted-foreground">
            All promo codes for {brandName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandProfileHeader;
