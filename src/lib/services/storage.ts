import { createClient } from '@/lib/supabase/client';

/**
 * Storage service — file upload/download helpers for Supabase Storage.
 * Buckets: event-posters, club-banners, avatars
 */

const getClient = () => createClient();

/** Upload a file to a storage bucket */
async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await getClient().storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  return getPublicUrl(bucket, path);
}

/** Get the public URL for a file in a bucket */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = getClient().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload an event poster image */
export async function uploadEventPoster(file: File, eventId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${eventId}/poster.${ext}`;
  return uploadFile('event-posters', path, file);
}

/** Upload a club banner image */
export async function uploadClubBanner(file: File, clubId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${clubId}/banner.${ext}`;
  return uploadFile('club-banners', path, file);
}

/** Upload a user avatar image */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  return uploadFile('avatars', path, file);
}

/** Delete a file from a bucket */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await getClient().storage.from(bucket).remove([path]);
  if (error) throw error;
}
