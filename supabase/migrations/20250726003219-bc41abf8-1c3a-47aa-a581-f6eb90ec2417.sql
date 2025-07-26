-- Enable real-time for agency_influencers table only
ALTER TABLE public.agency_influencers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_influencers;