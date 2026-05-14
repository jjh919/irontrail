import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
} from "@/lib/supabase/database.types";

export type TrainingPlan = Tables<"training_plans">;
export type PlannedWorkout = Tables<"planned_workouts">;

export type TrainingPlanInput = Omit<
  TablesInsert<"training_plans">,
  "id" | "user_id" | "created_at" | "generated_at"
>;
export type PlannedWorkoutInput = Omit<
  TablesInsert<"planned_workouts">,
  "id" | "user_id" | "created_at" | "plan_id"
>;

/** The currently active plan for this user (most recent if multiple). */
export async function getActivePlan(): Promise<TrainingPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_plans")
    .select()
    .eq("is_active", true)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Create a plan with all its planned workouts in two steps.
 * (Not transactional, but failures here are rare and recoverable —
 *  we mark the plan inactive if workout insert fails.)
 */
export async function createPlanWithWorkouts(
  plan: TrainingPlanInput,
  workouts: PlannedWorkoutInput[],
): Promise<TrainingPlan> {
  const supabase = await createClient();

  // Deactivate previous active plans first (only one active at a time).
  const { error: deactivateError } = await supabase
    .from("training_plans")
    .update({ is_active: false })
    .eq("is_active", true);
  if (deactivateError) throw deactivateError;

  const { data: created, error: planError } = await supabase
    .from("training_plans")
    .insert({ ...plan, is_active: true })
    .select()
    .single();
  if (planError) throw planError;

  if (workouts.length > 0) {
    const { error: pwError } = await supabase
      .from("planned_workouts")
      .insert(workouts.map((w) => ({ ...w, plan_id: created.id })));
    if (pwError) {
      // Best-effort rollback: mark plan inactive and surface the error.
      await supabase
        .from("training_plans")
        .update({ is_active: false })
        .eq("id", created.id);
      throw pwError;
    }
  }

  return created;
}

/** Planned workouts for the active plan within a date range. */
export async function listPlannedByDateRange(
  from: string,
  to: string,
): Promise<PlannedWorkout[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planned_workouts")
    .select()
    .gte("planned_date", from)
    .lte("planned_date", to)
    .order("planned_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Single planned workout for a given date (returns first if multiple). */
export async function getPlannedForDate(
  date: string,
): Promise<PlannedWorkout | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planned_workouts")
    .select()
    .eq("planned_date", date)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Link a planned workout to its completed actual workout. */
export async function markPlannedComplete(
  plannedId: string,
  workoutId: string,
): Promise<PlannedWorkout> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planned_workouts")
    .update({ completed_workout_id: workoutId })
    .eq("id", plannedId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
