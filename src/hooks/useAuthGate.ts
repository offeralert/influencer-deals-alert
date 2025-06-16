
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
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      navigate(redirectTo);
      return;
    }

    // Check if influencer status is required
    if (requireInfluencer && (!user || !profile?.is_influencer)) {
      navigate(redirectTo);
      return;
    }

    // Check if agency status is required
    if (requireAgency && (!user || !profile?.is_agency)) {
      navigate(redirectTo);
      return;
    }
  }, [user, profile, loading, requireAuth, requireInfluencer, requireAgency, redirectTo, navigate]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isInfluencer: !!profile?.is_influencer,
    isAgency: !!profile?.is_agency,
  };
};
