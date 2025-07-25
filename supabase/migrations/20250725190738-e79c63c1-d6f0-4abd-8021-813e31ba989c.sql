-- Remove the actual_influencer_id column from promo_codes table
-- This column is no longer needed since we now have proper agency_id and influencer_id separation

ALTER TABLE public.promo_codes 
DROP COLUMN IF EXISTS actual_influencer_id;