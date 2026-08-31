import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseIsConfigured, supabaseUrl } from "@/lib/config";

export const supabase = supabaseIsConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export const ensureSupabaseConfigured = () => {
  if (!supabase) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local."
    );
  }

  return supabase;
};
