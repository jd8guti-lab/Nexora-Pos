import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local."
    );
  }

  if (
    supabaseUrl.includes("tu-proyecto.supabase.co") ||
    supabaseKey.includes("tu-anon-key")
  ) {
    throw new Error(
      "La configuración de Supabase todavía está en valores de ejemplo. Reemplázalos con la URL real y la anon key del proyecto."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
