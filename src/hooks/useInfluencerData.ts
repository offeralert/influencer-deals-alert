
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

interface InfluencerProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  is_creditcard?: boolean;
}

export const useInfluencerData = (username: string | undefined) => {
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    fetchInfluencerData();
  }, [username]);

  const fetchInfluencerData = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_influencer', true)
        .single();
      
      if (profileError) {
        console.error("Error fetching influencer profile:", profileError);
        navigate("/not-found");
        return;
      }
      
      setInfluencer({
        id: profileData.id,
        full_name: profileData.full_name || 'Unnamed Influencer',
        username: profileData.username || 'influencer',
        avatar_url: profileData.avatar_url || DEFAULT_AVATAR_URL,
        is_creditcard: profileData.is_creditcard || false,
      });
      
    } catch (error) {
      console.error("Error in fetchInfluencerData:", error);
      navigate("/not-found");
    } finally {
      setLoading(false);
    }
  };

  return { influencer, loading };
};
