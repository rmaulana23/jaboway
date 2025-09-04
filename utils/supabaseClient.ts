import { createClient } from '@supabase/supabase-js'
import { Database } from '../types';

// FIX: Cast `import.meta` to `any` to bypass TypeScript error in Vite environments.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in your .env.local file");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);