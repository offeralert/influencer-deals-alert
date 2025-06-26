
import { useAuth } from "@/contexts/AuthContext";

const PersonalizedWelcomeBanner = () => {
  const { user, profile, isInfluencer, isAgency } = useAuth();

  if (!user || !profile) return null;

  const displayName = profile.full_name || profile.username || 'there';
  
  const getBannerStyles = () => {
    if (isAgency) {
      return "bg-brand-purple text-white";
    }
    if (isInfluencer) {
      return "bg-brand-green text-white";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getUserTypeLabel = () => {
    if (isAgency) return "Agency";
    if (isInfluencer) return "Influencer";
    return "Member";
  };

  return (
    <div className={`${getBannerStyles()} py-6 px-4`}>
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm md:text-base opacity-90">
            {getUserTypeLabel()} Dashboard • Discover the latest deals and offers
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedWelcomeBanner;
