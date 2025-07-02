
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Redirect based on the tab parameter or default to deals
    const tab = searchParams.get("tab");
    const category = searchParams.get("category");
    
    let redirectPath = "/deals";
    const queryParams = new URLSearchParams();
    
    if (category) {
      queryParams.set("category", category);
    }
    
    switch (tab) {
      case "influencers":
        redirectPath = "/influencers";
        break;
      case "brands":
        redirectPath = "/brands";
        break;
      case "creditcards":
        redirectPath = "/credit-cards";
        break;
      default:
        redirectPath = "/deals";
    }
    
    const queryString = queryParams.toString();
    const finalPath = queryString ? `${redirectPath}?${queryString}` : redirectPath;
    
    navigate(finalPath, { replace: true });
  }, [navigate, searchParams]);

  // Show loading while redirecting
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center py-16">
        <p>Redirecting...</p>
      </div>
    </div>
  );
};

export default Explore;
