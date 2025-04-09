
-- Create storage bucket for user avatars
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the avatars bucket
-- Allow public read access to all objects
CREATE POLICY "Public Read Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Authenticated Users Can Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own objects
CREATE POLICY "Users Can Update Own Objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner);

-- Allow users to delete their own objects
CREATE POLICY "Users Can Delete Own Objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner);
