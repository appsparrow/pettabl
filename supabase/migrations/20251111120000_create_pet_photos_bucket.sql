-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/edit their pet photos
CREATE POLICY "Fur bosses and admins can manage pet photos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'pet-photos');

-- Allow public read access to pet photos
CREATE POLICY "Pet photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');
