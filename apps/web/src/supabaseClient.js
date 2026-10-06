import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Faltan las variables de entorno de Supabase.\n' +
    'Crea un archivo .env en la raíz del proyecto con:\n' +
    'VITE_SUPABASE_URL=tu_url\n' +
    'VITE_SUPABASE_ANON_KEY=tu_anon_key'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
