-- Enable real-time replication for promo_codes table
ALTER TABLE public.promo_codes REPLICA IDENTITY FULL;

-- Enable real-time replication for profiles table  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;