-- Add agency_id column to promo_codes table
ALTER TABLE public.promo_codes 
ADD COLUMN agency_id uuid REFERENCES public.profiles(id);

-- Add index for better performance when querying by agency_id
CREATE INDEX idx_promo_codes_agency_id ON public.promo_codes(agency_id);

-- Update RLS policies to handle agency access via agency_id
DROP POLICY IF EXISTS "Agencies can manage their influencers promo codes" ON public.promo_codes;

CREATE POLICY "Agencies can manage promo codes they created" 
ON public.promo_codes 
FOR ALL 
USING (
  (auth.uid() = agency_id) OR
  (EXISTS ( 
    SELECT 1 FROM agency_influencers 
    WHERE agency_influencers.agency_id = auth.uid() 
    AND agency_influencers.influencer_id = promo_codes.influencer_id 
    AND agency_influencers.managed_by_agency = true
  ))
);

-- Allow agencies to view promo codes they created
CREATE POLICY "Agencies can view promo codes they created" 
ON public.promo_codes 
FOR SELECT 
USING (auth.uid() = agency_id);