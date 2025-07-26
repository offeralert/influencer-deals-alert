-- Enable real-time for agency_influencers table
ALTER TABLE public.agency_influencers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_influencers;

-- Enable real-time for profiles table  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;