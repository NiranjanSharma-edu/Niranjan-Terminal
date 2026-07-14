import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Log configuration status in development
if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('NiranjanOS: Supabase is successfully configured.');
  } else {
    console.warn('NiranjanOS: Supabase environment variables are missing. Running in DEMO MODE with localStorage persistence.');
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
