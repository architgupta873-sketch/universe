import { createClient } from '@/lib/supabase/client';

/**
 * Clubs service — CRUD operations for clubs.
 * Club data is relatively static so we fetch all clubs at once.
 */

const supabase = createClient();

/** Fetch all clubs ordered by name */
export async function fetchClubs() {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

/** Fetch a single club by ID */
export async function fetchClubById(clubId: string) {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single();

  if (error) throw error;
  return data;
}

/** Create a new club (admin only — enforced by RLS) */
export async function createClub(name: string, description: string = '') {
  const { data, error } = await supabase
    .from('clubs')
    .insert({ name, description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a club (admin only — enforced by RLS) */
export async function updateClub(
  clubId: string,
  updates: { name?: string; description?: string; banner_url?: string | null }
) {
  const { data, error } = await supabase
    .from('clubs')
    .update(updates)
    .eq('id', clubId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a club (admin only — enforced by RLS) */
export async function deleteClub(clubId: string) {
  const { error } = await supabase
    .from('clubs')
    .delete()
    .eq('id', clubId);

  if (error) throw error;
}
