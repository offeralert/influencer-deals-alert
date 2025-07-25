import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

interface InfluencerProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  is_creditcard?: boolean;
}

export const useInfluencerProfileById = (influencerId: string | null) => {
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!influencerId) {
      setInfluencer(null);
      setLoading(false);
      return;
    }

    fetchInfluencerData();
  }, [influencerId]);

  const fetchInfluencerData = async () => {
    if (!influencerId) return;
    
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', influencerId)
        .neq('is_agency', true)
        .neq('is_creditcard', true)
        .single();
      
      if (profileError) {
        console.error("Error fetching influencer profile:", profileError);
        setInfluencer(null);
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
      setInfluencer(null);
    } finally {
      setLoading(false);
    }
  };

  return { influencer, loading };
};