"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getUserRegisteredEventIds,
  registerForEvent as regService,
  unregisterFromEvent as unregService,
} from '@/lib/services/registrations';

/**
 * Registrations hook — tracks which events the current user is registered for.
 * Provides register/unregister actions that hit Supabase.
 */

interface UseRegistrationsReturn {
  registeredEventIds: string[];
  loading: boolean;
  error: string | null;
  registerForEvent: (eventId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRegistrations(userId: string | null): UseRegistrationsReturn {
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = useCallback(async () => {
    if (!userId) {
      setRegisteredEventIds([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const ids = await getUserRegisteredEventIds(userId);
      setRegisteredEventIds(ids);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load registrations';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const registerForEvent = async (eventId: string) => {
    if (!userId) return;
    try {
      setError(null);
      // Optimistic update
      setRegisteredEventIds((prev) => [...prev, eventId]);
      await regService(eventId, userId);
    } catch (err: unknown) {
      // Revert optimistic update
      setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!userId) return;
    try {
      setError(null);
      // Optimistic update
      setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
      await unregService(eventId, userId);
    } catch (err: unknown) {
      // Revert optimistic update
      setRegisteredEventIds((prev) => [...prev, eventId]);
      const message = err instanceof Error ? err.message : 'Unregistration failed';
      setError(message);
      throw err;
    }
  };

  return {
    registeredEventIds,
    loading,
    error,
    registerForEvent,
    unregisterFromEvent,
    refetch: loadRegistrations,
  };
}
