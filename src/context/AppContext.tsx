"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useClubs } from "@/hooks/useClubs";
import { useRegistrations } from "@/hooks/useRegistrations";
import { createClub as createClubService } from "@/lib/services/clubs";
import { createEvent as createEventService, deleteEvent as deleteEventService } from "@/lib/services/events";
import type { EventWithClub } from "@/lib/services/events";

// ─── Re-export types for backward compatibility ───
// All existing components import these from "@/context/AppContext"
export type UserRole = "admin" | "club_member" | "student" | null;
export type EventGenre = "Technical" | "Cultural" | "Fun" | "Sports" | "Workshops" | "Competitions" | "Gaming";
export type EventPricing = "Free" | "Paid";

export const ALL_GENRES: EventGenre[] = ["Technical", "Cultural", "Fun", "Sports", "Workshops", "Competitions", "Gaming"];
export const ALL_PRICING: EventPricing[] = ["Free", "Paid"];

// Event interface — same shape as before, but now comes from Supabase
export interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  date: string;
  venue: string;
  genre: EventGenre;
  eventType: EventPricing;
  // New fields from Supabase (optional for backward compat)
  club_id?: string;
  poster_url?: string | null;
  reward_points?: number;
  registration_limit?: number | null;
  status?: string;
}

// Context interface — SAME as before
interface AppContextType {
  // Auth
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  userId: string | null;
  userPoints: number;
  avatarUrl: string | null;
  setUserInfo: (name: string, email: string) => void;
  isLoading: boolean;
  authError: string | null;

  // Clubs
  clubs: string[];
  clubsData: { id: string; name: string; description: string; banner_url: string | null }[];
  addClub: (club: string) => void;
  refreshClubs: () => Promise<void>;

  // Events
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  deleteEvent: (eventId: string) => void;
  refreshEvents: () => Promise<void>;

  // Registrations
  registeredEventIds: string[];
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;

  // Auth actions
  logout: () => void;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignUp: (email: string, password: string, fullName: string, role: "admin" | "club_member" | "student") => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Convert Supabase event to the frontend Event interface */
function toFrontendEvent(e: EventWithClub): Event {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    clubName: e.clubName,
    date: e.date,
    venue: e.venue,
    genre: e.genre as EventGenre,
    eventType: e.event_type as EventPricing,
    club_id: e.club_id,
    poster_url: e.poster_url,
    reward_points: e.reward_points,
    registration_limit: e.registration_limit,
    status: e.status,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const eventsHook = useEvents();
  const clubsHook = useClubs();
  const regsHook = useRegistrations(auth.user?.id || null);

  // Derive role from profile (null if not logged in)
  const role: UserRole = auth.profile?.role || null;

  // Derive user info
  const userName = auth.profile?.full_name || "";
  const userEmail = auth.profile?.email || auth.user?.email || "";
  const userId = auth.user?.id || null;
  const userPoints = auth.profile?.points || 0;
  const avatarUrl = auth.profile?.avatar_url || null;

  // Convert events to frontend format
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    setEvents(eventsHook.events.map(toFrontendEvent));
  }, [eventsHook.events]);

  // Club names for backward compat (the original context only stored string[])
  const clubs = clubsHook.clubNames;
  const clubsData = clubsHook.clubs.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    banner_url: c.banner_url,
  }));

  // ── Action handlers ──────────────────────────────────

  // setRole — no-op in Supabase mode (role comes from DB profile)
  const setRole = useCallback(() => {
    // Role is determined by the profile in Supabase, not set manually
  }, []);

  // setUserInfo — no-op in Supabase mode (info comes from profile)
  const setUserInfo = useCallback(() => {
    // User info comes from Supabase profile
  }, []);

  // addClub — calls Supabase, then refreshes
  const addClub = useCallback(
    async (clubName: string) => {
      try {
        await createClubService(clubName);
        await clubsHook.refetch();
      } catch (err) {
        console.error("Failed to add club:", err);
      }
    },
    [clubsHook]
  );

  // addEvent — calls Supabase, then refreshes
  const addEvent = useCallback(
    async (event: Omit<Event, "id">) => {
      try {
        // Find club_id from club name
        const club = clubsHook.clubs.find((c) => c.name === event.clubName);
        if (!club) {
          console.error("Club not found:", event.clubName);
          return;
        }

        await createEventService({
          title: event.title,
          description: event.description,
          club_id: club.id,
          venue: event.venue,
          date: event.date,
          genre: event.genre,
          event_type: event.eventType,
          reward_points: event.reward_points || 10,
          registration_limit: event.registration_limit || null,
          poster_url: event.poster_url || null,
          created_by: userId,
        });
        await eventsHook.refetch();
      } catch (err) {
        console.error("Failed to create event:", err);
      }
    },
    [clubsHook.clubs, userId, eventsHook]
  );

  // deleteEvent — calls Supabase, then refreshes
  const deleteEvent = useCallback(
    async (eventId: string) => {
      try {
        await deleteEventService(eventId);
        await eventsHook.refetch();
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    },
    [eventsHook]
  );

  // registerForEvent — calls Supabase hook (with optimistic update)
  const registerForEvent = useCallback(
    async (eventId: string) => {
      try {
        await regsHook.registerForEvent(eventId);
        // Refresh profile to get updated points
        await auth.refreshProfile();
      } catch (err) {
        console.error("Failed to register:", err);
      }
    },
    [regsHook, auth]
  );

  // unregisterFromEvent
  const unregisterFromEvent = useCallback(
    async (eventId: string) => {
      try {
        await regsHook.unregisterFromEvent(eventId);
        await auth.refreshProfile();
      } catch (err) {
        console.error("Failed to unregister:", err);
      }
    },
    [regsHook, auth]
  );

  // logout — calls Supabase signOut
  const logout = useCallback(async () => {
    await auth.handleSignOut();
  }, [auth]);

  const isLoading = auth.loading || eventsHook.loading || clubsHook.loading;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        userName,
        userEmail,
        userId,
        userPoints,
        avatarUrl,
        setUserInfo,
        isLoading,
        authError: auth.error,
        clubs,
        clubsData,
        addClub,
        refreshClubs: clubsHook.refetch,
        events,
        addEvent,
        deleteEvent,
        refreshEvents: eventsHook.refetch,
        registeredEventIds: regsHook.registeredEventIds,
        registerForEvent,
        unregisterFromEvent,
        logout,
        handleSignIn: auth.handleSignIn,
        handleSignUp: auth.handleSignUp,
        refreshProfile: auth.refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
