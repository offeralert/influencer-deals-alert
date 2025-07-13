
import { Session, User } from "@supabase/supabase-js";

export type ProfileType = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_influencer?: boolean;
  is_featured?: boolean;
  is_agency?: boolean;
  is_creditcard?: boolean;
  category?: string;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  loading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isInfluencer: boolean;
  isAgency: boolean;
  isAuthenticated: boolean;
  profileLoading: boolean;
  justSignedUp: boolean;
  setJustSignedUp: (value: boolean) => void;
  error: string | null;
};
