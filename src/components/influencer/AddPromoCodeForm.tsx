
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PromoCodeForm from "@/components/PromoCodeForm";

interface AddPromoCodeFormProps {
  onPromoCodeAdded?: () => void;
}

const AddPromoCodeForm = ({ onPromoCodeAdded }: AddPromoCodeFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Promo Code</CardTitle>
        <CardDescription>
          Add a new promotional code to share with your audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PromoCodeForm onPromoCodeAdded={onPromoCodeAdded} />
      </CardContent>
    </Card>
  );
};

export default AddPromoCodeForm;
