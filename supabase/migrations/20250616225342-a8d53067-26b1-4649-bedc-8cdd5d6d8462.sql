
-- Add is_agency field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_agency BOOLEAN DEFAULT false;

-- Create agency_influencers table to track relationships
CREATE TABLE public.agency_influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  managed_by_agency BOOLEAN DEFAULT true,
  UNIQUE(agency_id, influencer_id)
);

-- Enable RLS on agency_influencers table
ALTER TABLE public.agency_influencers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agency_influencers table
CREATE POLICY "Agencies can view their own influencers" 
  ON public.agency_influencers 
  FOR SELECT 
  USING (
    auth.uid() = agency_id OR 
    auth.uid() = influencer_id
  );

CREATE POLICY "Agencies can manage their own influencers" 
  ON public.agency_influencers 
  FOR ALL 
  USING (auth.uid() = agency_id);

-- Create function to check if user is an agency
CREATE OR REPLACE FUNCTION public.is_agency(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_agency = true
  );
$$;

-- Create function to check if user manages an influencer
CREATE OR REPLACE FUNCTION public.manages_influencer(agency_id UUID, influencer_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agency_influencers 
    WHERE agency_id = $1 AND influencer_id = $2 AND managed_by_agency = true
  );
$$;

-- Update promo_codes RLS to allow agencies to manage their influencers' codes
CREATE POLICY "Agencies can manage their influencers promo codes" 
  ON public.promo_codes 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_influencers 
      WHERE agency_id = auth.uid() 
      AND influencer_id = promo_codes.influencer_id 
      AND managed_by_agency = true
    )
  );
