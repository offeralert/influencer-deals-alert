
import { ProfileType } from "@/contexts/auth/types";

export const getDashboardRoute = (profile: ProfileType | null): string => {
  // Ultra-simple logic: Agency goes to agency dashboard, everyone else goes to influencer dashboard
  if (profile?.is_agency) return "/agency-dashboard";
  return "/influencer-dashboard";
};
