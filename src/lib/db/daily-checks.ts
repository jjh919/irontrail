import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";

export type DailyCheck = Tables<"daily_checks">;
export type DailyCheckInput = Omit<
  TablesInsert<"daily_checks">,
  "user_id" | "created_at" | "updated_at"
>;

export async function getDailyCheck(date: string): Promise<DailyCheck | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_checks")
    .select()
    .eq("check_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listDailyChecks(
  from: string,
  to: string,
): Promise<DailyCheck[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_checks")
    .select()
    .gte("check_date", from)
    .lte("check_date", to)
    .order("check_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Insert or update the check for the given date.
 * user_id auto-fills via DEFAULT auth.uid(); composite PK (user_id, check_date)
 * triggers the UPDATE branch on conflict.
 */
export async function upsertDailyCheck(
  input: DailyCheckInput,
): Promise<DailyCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_checks")
    .upsert(
      { ...input, user_id: user.id },
      { onConflict: "user_id,check_date" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDailyCheck(date: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_checks")
    .delete()
    .eq("check_date", date);
  if (error) throw error;
}
