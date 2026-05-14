import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Admin client — bypasses RLS. Use ONLY in trusted server contexts:
 * - Strava webhook handler (no user session, must filter by user_id explicitly)
 * - Background sync jobs
 * - Migration/seed scripts
 *
 * Every write MUST include an explicit `user_id` filter to maintain tenancy.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY for admin client",
    );
  }

  return createSupabaseClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
