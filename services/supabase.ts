import { createClient } from '@supabase/supabase-js';

// Vite handles replacement of import.meta.env during the build process.
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Supabase credentials missing! Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Environment Variables."
  );
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_KEY || ''
);