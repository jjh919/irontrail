import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Race = Tables<"races">;
export type RaceInput = Omit<TablesInsert<"races">, "id" | "user_id" | "created_at" | "updated_at">;
export type RacePatch = Omit<TablesUpdate<"races">, "id" | "user_id" | "created_at" | "updated_at">;

/** All races for the current user, soonest race first. */
export async function listRaces(): Promise<Race[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .select()
    .order("race_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** The "A" priority race nearest to today; null if none upcoming. */
export async function getCurrentARace(): Promise<Race | null> {
  const today = new Date().toISOString().slice(0, 10);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .select()
    .eq("priority", "A")
    .gte("race_date", today)
    .order("race_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRace(id: string): Promise<Race | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRace(input: RaceInput): Promise<Race> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRace(id: string, patch: RacePatch): Promise<Race> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRace(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("races").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Compute D-day relative to today (local UTC date).
 * Negative = race already passed.
 */
export function dDayFromToday(raceDate: string): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const race = new Date(raceDate + "T00:00:00Z");
  return Math.round((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
