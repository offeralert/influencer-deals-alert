-- Add a new column to track which influencer a promo code is for when created by an agency
ALTER TABLE public.promo_codes 
ADD COLUMN actual_influencer_id UUID REFERENCES public.profiles(id);

-- Create an index for performance
CREATE INDEX idx_promo_codes_actual_influencer_id ON public.promo_codes(actual_influencer_id);

-- Update existing promo codes where the influencer_id points to an agency
-- We need to identify which influencer each agency-created promo code should be attributed to
-- For now, let's create a function to help with this

CREATE OR REPLACE FUNCTION public.fix_agency_promo_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- For promo codes created by agencies, we need to determine the correct influencer
    -- This is a complex migration that requires business logic to determine attribution
    -- For now, we'll just identify the problematic records
    
    -- Log problematic records
    RAISE NOTICE 'Found % promo codes created by agencies that need attribution fix', 
        (SELECT COUNT(*) 
         FROM public.promo_codes pc 
         JOIN public.profiles p ON pc.influencer_id = p.id 
         WHERE p.is_agency = true);
    
    -- We'll need to update these manually or with additional business logic
    -- to determine which influencer each promo code should be attributed to
END;
$$;

-- Run the function to see how many records need fixing
SELECT public.fix_agency_promo_codes();