import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client singleton.
 * Used in all client components ("use client") and hooks.
 *
 * Uses @supabase/ssr for proper cookie handling in Next.js.
 *
 * NOTE: We don't pass Database generics here because our hand-written types
 * have minor mismatches with Supabase's strict expectations. Instead, we use
 * manual type assertions in the service layer where needed.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
