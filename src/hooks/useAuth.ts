"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfile, signIn, signUp, signOut } from '@/lib/services/auth';
import type { UserRole } from '@/lib/database.types';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Auth hook — provides session state, user profile, and auth actions.
 * Listens to Supabase onAuthStateChange for reactive updates.
 */

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  points: number;
}

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  handleSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch profile for a user
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await getProfile(userId);
      setProfile(p as Profile);
    } catch {
      // Profile might not exist yet (e.g., during signup trigger delay)
      setProfile(null);
    }
  }, []);

  // Initialize: check current session and listen for changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch {
        // Session retrieval failed — user is not logged in
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          if (event === 'SIGNED_IN') {
            // Fetch immediately — profile may already exist
            await fetchProfile(newSession.user.id);
            // Retry after short delay in case the DB trigger hasn't fired yet
            setTimeout(() => fetchProfile(newSession.user.id), 800);
          } else {
            await fetchProfile(newSession.user.id);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => {
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    error,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    refreshProfile,
  };
}
