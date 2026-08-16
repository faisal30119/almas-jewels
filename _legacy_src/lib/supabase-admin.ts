import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase admin environment variables are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
