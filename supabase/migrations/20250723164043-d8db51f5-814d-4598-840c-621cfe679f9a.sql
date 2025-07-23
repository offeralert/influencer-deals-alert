-- Add social media URL columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN instagram_url TEXT,
ADD COLUMN tiktok_url TEXT,
ADD COLUMN x_url TEXT,
ADD COLUMN youtube_url TEXT,
ADD COLUMN linkedin_url TEXT;