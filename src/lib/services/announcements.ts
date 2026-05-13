import { createClient } from '@/lib/supabase/client';

/**
 * Announcements service — CRUD for club announcements.
 */

const getClient = () => createClient();

/** Fetch all announcements, optionally filtered by club */
export async function fetchAnnouncements(clubId?: string) {
  let query = getClient()
    .from('announcements')
    .select('*, clubs(name), profiles(full_name)')
    .order('created_at', { ascending: false });

  if (clubId) {
    query = query.eq('club_id', clubId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/** Create a new announcement */
export async function createAnnouncement(announcement: {
  club_id: string;
  title: string;
  content: string;
  created_by?: string | null;
}) {
  const { data, error } = await getClient()
    .from('announcements')
    .insert({
      club_id: announcement.club_id,
      title: announcement.title,
      content: announcement.content,
      created_by: announcement.created_by ?? null,
    })
    .select('*, clubs(name)')
    .single();

  if (error) throw error;
  return data;
}

/** Delete an announcement */
export async function deleteAnnouncement(announcementId: string) {
  const { error } = await getClient()
    .from('announcements')
    .delete()
    .eq('id', announcementId);

  if (error) throw error;
}
