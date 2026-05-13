"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, type EventWithClub } from '@/lib/services/events';

/**
 * Events hook — fetches events from Supabase and provides loading/error states.
 * Returns events sorted by date ascending (matching original behavior).
 */

interface UseEventsReturn {
  events: EventWithClub[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load events';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { events, loading, error, refetch: loadEvents };
}
