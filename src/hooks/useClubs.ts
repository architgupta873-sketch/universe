"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchClubs } from '@/lib/services/clubs';
import type { Database } from '@/lib/database.types';

type Club = Database['public']['Tables']['clubs']['Row'];

/**
 * Clubs hook — fetches all clubs from Supabase.
 */

interface UseClubsReturn {
  clubs: Club[];
  clubNames: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClubs(): UseClubsReturn {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClubs();
      setClubs(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load clubs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const clubNames = clubs.map((c) => c.name);

  return { clubs, clubNames, loading, error, refetch: loadClubs };
}
