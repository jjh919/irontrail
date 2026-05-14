import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Sport,
} from "@/lib/supabase/database.types";
import { intervalToSeconds } from "@/lib/date";

export type Workout = Tables<"workouts">;
export type WorkoutInput = Omit<
  TablesInsert<"workouts">,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type WorkoutPatch = Omit<
  TablesUpdate<"workouts">,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface ListWorkoutsOptions {
  from?: string; // ISO date inclusive
  to?: string; // ISO date inclusive
  sport?: Sport;
  limit?: number;
}

export async function listWorkouts(
  options: ListWorkoutsOptions = {},
): Promise<Workout[]> {
  const supabase = await createClient();
  let query = supabase
    .from("workouts")
    .select()
    .order("workout_date", { ascending: false });
  if (options.from) query = query.gte("workout_date", options.from);
  if (options.to) query = query.lte("workout_date", options.to);
  if (options.sport) query = query.eq("sport", options.sport);
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createWorkout(input: WorkoutInput): Promise<Workout> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorkout(
  id: string,
  patch: WorkoutPatch,
): Promise<Workout> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWorkout(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Aggregations (client-side; fine for personal-scale data)
// ---------------------------------------------------------------------------

export interface SportBreakdown {
  count: number;
  durationSec: number;
  distanceKm: number;
}

export interface WorkoutSummary {
  count: number;
  totalDurationSec: number;
  totalDistanceKm: number;
  bySport: Record<Sport, SportBreakdown>;
}

function emptyBySport(): WorkoutSummary["bySport"] {
  return {
    swim: { count: 0, durationSec: 0, distanceKm: 0 },
    bike: { count: 0, durationSec: 0, distanceKm: 0 },
    run: { count: 0, durationSec: 0, distanceKm: 0 },
    weight: { count: 0, durationSec: 0, distanceKm: 0 },
    other: { count: 0, durationSec: 0, distanceKm: 0 },
  };
}

export function summarize(workouts: Workout[]): WorkoutSummary {
  const out: WorkoutSummary = {
    count: workouts.length,
    totalDurationSec: 0,
    totalDistanceKm: 0,
    bySport: emptyBySport(),
  };
  for (const w of workouts) {
    const sec = intervalToSeconds(w.duration);
    const km = w.distance_km ?? 0;
    out.totalDurationSec += sec;
    out.totalDistanceKm += km;
    const bucket = out.bySport[w.sport];
    bucket.count += 1;
    bucket.durationSec += sec;
    bucket.distanceKm += km;
  }
  return out;
}

export async function weekSummary(from: string, to: string): Promise<WorkoutSummary> {
  const ws = await listWorkouts({ from, to });
  return summarize(ws);
}
