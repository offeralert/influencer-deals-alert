
-- Add temporary_password column to agency_influencers table
ALTER TABLE public.agency_influencers 
ADD COLUMN temporary_password TEXT;

-- Add an index for better performance when querying by agency_id
CREATE INDEX IF NOT EXISTS idx_agency_influencers_agency_id 
ON public.agency_influencers(agency_id);
