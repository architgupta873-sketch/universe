import { createClient } from '@/lib/supabase/client';

/**
 * Registrations service — handles event registration/unregistration
 * and reward point accounting.
 */

const supabase = createClient();

/** Register a user for an event and award points */
export async function registerForEvent(eventId: string, userId: string) {
  // 1. Insert registration row
  const { error: regError } = await supabase
    .from('registrations')
    .insert({ event_id: eventId, user_id: userId });

  if (regError) {
    // Duplicate registration — unique constraint violation
    if (regError.code === '23505') {
      throw new Error('Already registered for this event');
    }
    throw regError;
  }

  // 2. Fetch event reward_points to award to the user
  const { data: event } = await supabase
    .from('events')
    .select('reward_points')
    .eq('id', eventId)
    .single();

  if (event?.reward_points) {
    // Increment user points using RPC or direct update
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ points: profile.points + event.reward_points })
        .eq('id', userId);
    }
  }
}

/** Unregister a user from an event and deduct points */
export async function unregisterFromEvent(eventId: string, userId: string) {
  // 1. Fetch event reward_points to deduct
  const { data: event } = await supabase
    .from('events')
    .select('reward_points')
    .eq('id', eventId)
    .single();

  // 2. Delete registration row
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;

  // 3. Deduct points
  if (event?.reward_points) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ points: Math.max(0, profile.points - event.reward_points) })
        .eq('id', userId);
    }
  }
}

/** Get all event IDs that a user is registered for */
export async function getUserRegisteredEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('event_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((r) => r.event_id);
}

/** Get all registrations for a specific event (for club dashboard) */
export async function getEventRegistrations(eventId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, profiles(full_name, email)')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Get full registered events for a user (with event details) */
export async function getUserRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, events(*, clubs(name))')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
