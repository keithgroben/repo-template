import { createClient } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    return supabase.auth.signOut();
}

export async function getSession() {
    return supabase.auth.getSession();
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
}
