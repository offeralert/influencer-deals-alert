-- Enable realtime for the agency_influencers table
ALTER TABLE public.agency_influencers REPLICA IDENTITY FULL;

-- Enable realtime for the profiles table  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Enable realtime for the promo_codes table
ALTER TABLE public.promo_codes REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_influencers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;