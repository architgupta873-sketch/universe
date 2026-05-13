import { createClient } from '@/lib/supabase/client';

/**
 * Authentication service — wraps Supabase Auth methods.
 * All auth state changes are broadcast via onAuthStateChange in AppContext.
 *
 * SECURITY: Role assignment happens in the DB trigger (handle_new_user).
 * The client always passes 'student' — the trigger checks the email
 * and assigns 'admin' only to the configured admin email.
 */

const supabase = createClient();

/** Sign up a new user with email and password.
 *  Role is ALWAYS determined server-side by the DB trigger — not by the client.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _role: string = 'student' // ignored — DB trigger assigns role by email
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/** Sign out the current user */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the current session */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Get the current user */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/** Fetch the profile for a given user ID */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/** Update a user's profile */
export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string | null;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Listen for auth state changes */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
