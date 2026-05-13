-- =============================================================
-- UniVerse — Supabase Storage Configuration
-- =============================================================
-- Run this in the Supabase SQL Editor after schema.sql
-- =============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('event-posters', 'event-posters', true),
  ('club-banners', 'club-banners', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage Policies ──────────────────────────────────────

-- Event Posters: anyone can read, club_member/admin can upload
CREATE POLICY "Event posters: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-posters');

CREATE POLICY "Event posters: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-posters'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Event posters: owner can update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-posters'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Event posters: owner or admin can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-posters'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.get_user_role() = 'admin'
    )
  );

-- Club Banners: anyone can read, admin can upload
CREATE POLICY "Club banners: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-banners');

CREATE POLICY "Club banners: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'club-banners'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Club banners: admin can update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'club-banners'
    AND public.get_user_role() = 'admin'
  );

CREATE POLICY "Club banners: admin can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'club-banners'
    AND public.get_user_role() = 'admin'
  );

-- Avatars: anyone can read, users can manage their own
CREATE POLICY "Avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatars: users upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars: users update own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars: users delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
