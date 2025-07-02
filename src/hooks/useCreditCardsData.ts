
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Influencer, SortOption } from "@/types/explore";

export const useCreditCardsData = (
  sortOption: SortOption,
  searchQuery: string = ""
) => {
  const [creditCards, setCreditCards] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditCards = async () => {
      setLoading(true);
      console.log('[CREDIT_CARDS] Starting fetchCreditCards...');
      
      try {
        // First get all unique influencer IDs from promo codes
        const { data: promoCodeData, error: promoError } = await supabase
          .from('promo_codes')
          .select('influencer_id');

        if (promoError) {
          console.error("[CREDIT_CARDS] Error fetching promo code credit cards:", promoError);
          setCreditCards([]);
          return;
        }

        console.log(`[CREDIT_CARDS] Found ${promoCodeData?.length || 0} promo codes for credit cards`);

        // Extract unique influencer IDs
        const creditCardIds = [...new Set(promoCodeData?.map(p => p.influencer_id) || [])];
        console.log(`[CREDIT_CARDS] Unique credit card IDs: ${creditCardIds.length}`);

        if (creditCardIds.length === 0) {
          console.log('[CREDIT_CARDS] No credit card IDs found, setting empty array');
          setCreditCards([]);
          return;
        }

        // Now fetch only those credit cards who have promo codes
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_creditcard', true)
          .in('id', creditCardIds)
          .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
                 { ascending: sortOption === 'alphabetical' });
        
        if (error) {
          console.error("[CREDIT_CARDS] Error fetching credit cards:", error);
          setCreditCards([]);
          return;
        }
        
        console.log(`[CREDIT_CARDS] Fetched ${data?.length || 0} credit card profiles`);
        
        const formattedCreditCards = data?.map(profile => ({
          id: profile.id,
          full_name: profile.full_name || 'Unnamed Credit Card',
          username: profile.username || 'creditcard',
          avatar_url: profile.avatar_url,
          is_creditcard: profile.is_creditcard
        })) || [];
        
        // Filter by search query if provided
        const filtered = searchQuery
          ? formattedCreditCards.filter(card => 
              card.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : formattedCreditCards;
        
        console.log(`[CREDIT_CARDS] Final credit cards count after filtering: ${filtered.length}`);
        setCreditCards(filtered);
      } catch (error) {
        console.error("[CREDIT_CARDS] Error in fetchCreditCards:", error);
        setCreditCards([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreditCards();
  }, [sortOption, searchQuery]);

  return { creditCards, loading };
};
