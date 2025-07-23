
import { User, Session } from "@supabase/supabase-js";

export interface ProfileType {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_agency?: boolean;
  is_fake?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
  is_creditcard?: boolean;
  instagram_url?: string;
  tiktok_url?: string;
  x_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  loading: boolean;
  isLoading: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isInfluencer: boolean;
  isAgency: boolean;
  isAuthenticated: boolean;
}
