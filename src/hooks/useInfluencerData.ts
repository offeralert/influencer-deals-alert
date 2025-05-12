
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface InfluencerProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  is_creditcard?: boolean; // Add this property
}

export const useInfluencerData = (id: string | undefined) => {
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    fetchInfluencerData();
  }, [id]);

  const fetchInfluencerData = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
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
        avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
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
