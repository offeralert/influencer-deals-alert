
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UniversalPromoCode } from "@/utils/supabaseQueries";

export const useBrandData = (brandName: string | undefined) => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<UniversalPromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandName) {
      navigate("/");
      return;
    }

    fetchBrandData();
  }, [brandName]);

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('universal_promo_codes')
        .select('*')
        .eq('brand_name', brandName)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching brand promo codes:", error);
        return;
      }
      
      if (!data || data.length === 0) {
        navigate("/not-found");
        return;
      }
      
      setPromoCodes(data);
      
    } catch (error) {
      console.error("Error in fetchBrandData:", error);
      navigate("/not-found");
    } finally {
      setLoading(false);
    }
  };

  return { promoCodes, loading, brandName };
};
