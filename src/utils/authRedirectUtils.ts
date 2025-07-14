
import { ProfileType } from "@/contexts/auth/types";

export const getDashboardRoute = (profile: ProfileType | null): string => {
  if (!profile) return "/influencer-apply";
  
  if (profile.is_agency) return "/agency-dashboard";
  if (profile.is_influencer) return "/influencer-dashboard";
  
  return "/influencer-apply";
};
