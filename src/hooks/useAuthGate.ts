
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthGateOptions = {
  requiredRole?: "influencer" | "admin" | null;
  redirectTo?: string;
};

/**
 * A hook that provides authentication gating functionality
 * 
 * @param options Configuration options for the auth gate
 * @returns Object containing authentication state
 */
export function useAuthGate(options: AuthGateOptions = {}) {
  const { requiredRole = null, redirectTo = "/login" } = options;
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only make determination when auth loading is complete
    if (!authLoading) {
      console.log("Auth gate check:", { 
        user, 
        profile, 
        requiredRole, 
        "is_influencer": profile?.is_influencer 
      });
      
      // User is not logged in
      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        console.log("Auth gate: No user, redirecting to", redirectTo);
        navigate(redirectTo);
        return;
      }
      
      // Role check - specific roles needed
      if (requiredRole) {
        if (requiredRole === "influencer" && !profile?.is_influencer) {
          setIsAuthorized(false);
          setIsLoading(false);
          console.log("Auth gate: Not an influencer, redirecting to /influencer-apply");
          toast.error("This page requires influencer status. Please apply to become an influencer.");
          navigate("/influencer-apply");
          return;
        }
        
        // Add other role checks here as needed
      }
      
      // User is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [user, profile, authLoading, requiredRole, redirectTo, navigate]);
  
  return { isAuthorized, isLoading };
}
