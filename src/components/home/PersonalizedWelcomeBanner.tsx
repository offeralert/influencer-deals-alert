
import { useAuth } from "@/contexts/AuthContext";

const PersonalizedWelcomeBanner = () => {
  const { user, profile, isInfluencer, isAgency, profileLoading } = useAuth();

  // Don't render anything if no user
  if (!user) return null;

  // Show loading state while profile is being fetched
  if (profileLoading || !profile) {
    return (
      <div className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
