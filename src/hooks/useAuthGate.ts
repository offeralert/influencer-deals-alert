
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UseAuthGateOptions {
  requireAuth?: boolean;
  requireInfluencer?: boolean;
  requireAgency?: boolean;
  redirectTo?: string;
}

export const useAuthGate = ({
  requireAuth = false,
  requireInfluencer = false,
  requireAgency = false,
  redirectTo = "/login"
}: UseAuthGateOptions = {}) => {
  const { user, profile, isReady, isInfluencer, isAgency } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while loading
    if (!isReady) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      navigate(redirectTo);
      return;
    }

    // Check if influencer status is required
    if (requireInfluencer && (!user || !isInfluencer)) {
      navigate(redirectTo);
      return;
    }

    // Check if agency status is required
    if (requireAgency && (!user || !isAgency)) {
      navigate(redirectTo);
      return;
    }
  }, [user, profile, isReady, requireAuth, requireInfluencer, requireAgency, redirectTo, navigate, isInfluencer, isAgency]);

  return {
    user,
    profile,
    loading: !isReady,
    isLoading: !isReady,
    isAuthenticated: !!user,
    isAuthorized: true,
    isInfluencer,
    isAgency,
  };
};
