-- Create storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for activity photos
CREATE POLICY "Authenticated users can upload activity photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activity-photos');

CREATE POLICY "Activity photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activity-photos');

CREATE POLICY "Users can update their own activity photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'activity-photos' AND owner = auth.uid());

CREATE POLICY "Users can delete their own activity photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activity-photos' AND owner = auth.uid());

