import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseServerEnv() {
  return Boolean(supabaseUrl && (supabaseServiceRoleKey || supabasePublishableKey));
}

export function createSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || (!supabaseServiceRoleKey && !supabasePublishableKey)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey ?? supabasePublishableKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
