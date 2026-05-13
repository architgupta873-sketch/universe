/**
 * TypeScript types for the Supabase database schema.
 * These mirror the tables defined in supabase/schema.sql.
 *
 * For a production project, generate these automatically via:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 */

export type UserRole = 'admin' | 'club_member' | 'student';
export type EventStatus = 'pending' | 'approved' | 'rejected';
export type EventGenre = 'Technical' | 'Cultural' | 'Fun' | 'Sports' | 'Workshops' | 'Competitions' | 'Gaming';
export type EventPricing = 'Free' | 'Paid';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          points?: number;
          updated_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string;
          banner_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          banner_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          banner_url?: string | null;
          updated_at?: string;
        };
      };
      club_memberships: {
        Row: {
          id: string;
          user_id: string;
          club_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          club_id: string;
          joined_at?: string;
        };
        Update: {
          user_id?: string;
          club_id?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          club_id: string;
          venue: string;
          date: string;
          genre: EventGenre;
          event_type: EventPricing;
          poster_url: string | null;
          reward_points: number;
          registration_limit: number | null;
          status: EventStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          club_id: string;
          venue?: string;
          date: string;
          genre?: EventGenre;
          event_type?: EventPricing;
          poster_url?: string | null;
          reward_points?: number;
          registration_limit?: number | null;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          club_id?: string;
          venue?: string;
          date?: string;
          genre?: EventGenre;
          event_type?: EventPricing;
          poster_url?: string | null;
          reward_points?: number;
          registration_limit?: number | null;
          status?: EventStatus;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registered_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          club_id: string;
          title: string;
          content: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          title: string;
          content?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
        };
      };
    };
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_club_member: {
        Args: { p_club_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      event_status: EventStatus;
      event_genre: EventGenre;
      event_pricing: EventPricing;
    };
  };
}
