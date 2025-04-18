
import { useBrandData } from "@/hooks/useBrandData";
import { useParams } from "react-router-dom";
import BrandProfileHeader from "@/components/brand/BrandProfileHeader";
import BrandPromoCodes from "@/components/brand/BrandPromoCodes";

const BrandProfile = () => {
  const { brandName } = useParams<{ brandName: string }>();
  const decodedBrandName = brandName ? decodeURIComponent(brandName) : "";
  const { promoCodes, loading } = useBrandData(decodedBrandName);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading brand profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BrandProfileHeader brandName={decodedBrandName} />
      <BrandPromoCodes promoCodes={promoCodes} />
    </div>
  );
};

export default BrandProfile;
