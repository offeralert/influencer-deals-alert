-- Enable real-time for promo_codes table
ALTER TABLE public.promo_codes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;