import { createClient } from '@/lib/supabase/client';
import type { EventGenre, EventPricing, EventStatus } from '@/lib/database.types';

/**
 * Events service — CRUD operations for events.
 * Includes club name join via `clubs(name)` for display convenience.
 */

const getClient = () => createClient();

/** Shape of an event row with the joined club name */
export interface EventWithClub {
  id: string;
  title: string;
  description: string;
  club_id: string;
  clubName: string;  // joined from clubs table
  venue: string;
  date: string;
  genre: EventGenre;
  event_type: EventPricing;
  eventType: EventPricing;  // alias for frontend compat
  poster_url: string | null;
  reward_points: number;
  registration_limit: number | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Transform raw DB row + joined club into EventWithClub */
function transformEvent(row: Record<string, unknown>): EventWithClub {
  const clubs = row.clubs as { name: string } | null;
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    club_id: row.club_id as string,
    clubName: clubs?.name || 'Unknown',
    venue: (row.venue as string) || '',
    date: row.date as string,
    genre: row.genre as EventGenre,
    event_type: row.event_type as EventPricing,
    eventType: row.event_type as EventPricing,
    poster_url: row.poster_url as string | null,
    reward_points: (row.reward_points as number) || 10,
    registration_limit: row.registration_limit as number | null,
    status: row.status as EventStatus,
    created_by: row.created_by as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/** Fetch all events (joins club name), ordered by date ascending */
export async function fetchEvents(filters?: {
  status?: EventStatus;
  clubId?: string;
  genre?: EventGenre;
}) {
  let query = getClient()
    .from('events')
    .select('*, clubs(name)')
    .order('date', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.clubId) {
    query = query.eq('club_id', filters.clubId);
  }
  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(transformEvent);
}

/** Fetch a single event by ID */
export async function fetchEventById(eventId: string) {
  const { data, error } = await getClient()
    .from('events')
    .select('*, clubs(name)')
    .eq('id', eventId)
    .single();

  if (error) throw error;
  return transformEvent(data as Record<string, unknown>);
}

/** Create a new event */
export async function createEvent(event: {
  title: string;
  description: string;
  club_id: string;
  venue: string;
  date: string;
  genre: EventGenre;
  event_type: EventPricing;
  poster_url?: string | null;
  reward_points?: number;
  registration_limit?: number | null;
  created_by?: string | null;
}) {
  const { data, error } = await getClient()
    .from('events')
    .insert({
      ...event,
      status: 'pending' as EventStatus,
    })
    .select('*, clubs(name)')
    .single();

  if (error) throw error;
  return transformEvent(data as Record<string, unknown>);
}

/** Update an event */
export async function updateEvent(
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    venue?: string;
    date?: string;
    genre?: EventGenre;
    event_type?: EventPricing;
    poster_url?: string | null;
    reward_points?: number;
    registration_limit?: number | null;
    status?: EventStatus;
  }
) {
  const { data, error } = await getClient()
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select('*, clubs(name)')
    .single();

  if (error) throw error;
  return transformEvent(data as Record<string, unknown>);
}

/** Delete an event (admin only — enforced by RLS) */
export async function deleteEvent(eventId: string) {
  const { error } = await getClient()
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}

/** Approve an event (admin sets status to 'approved') */
export async function approveEvent(eventId: string) {
  return updateEvent(eventId, { status: 'approved' });
}

/** Reject an event (admin sets status to 'rejected') */
export async function rejectEvent(eventId: string) {
  return updateEvent(eventId, { status: 'rejected' });
}

/** Get the registration count for an event */
export async function getRegistrationCount(eventId: string) {
  const { count, error } = await getClient()
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) throw error;
  return count || 0;
}
