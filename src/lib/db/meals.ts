import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Meal = Tables<"meals">;
export type MealInput = Omit<
  TablesInsert<"meals">,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type MealPatch = Omit<
  TablesUpdate<"meals">,
  "id" | "user_id" | "created_at" | "updated_at"
>;

/**
 * All meals for a given calendar day (UTC bucketing — good enough for personal use).
 */
export async function listMealsForDate(date: string): Promise<Meal[]> {
  const supabase = await createClient();
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from("meals")
    .select()
    .gte("eaten_at", dayStart)
    .lte("eaten_at", dayEnd)
    .order("eaten_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMeal(id: string): Promise<Meal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createMeal(input: MealInput): Promise<Meal> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMeal(id: string, patch: MealPatch): Promise<Meal> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMeal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Day totals (kcal + macros)
// ---------------------------------------------------------------------------

export interface DayNutritionTotals {
  kcal: number;
  carb_g: number;
  protein_g: number;
  fat_g: number;
}

export function totalNutrition(meals: Meal[]): DayNutritionTotals {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal ?? 0),
      carb_g: acc.carb_g + (m.carb_g ?? 0),
      protein_g: acc.protein_g + (m.protein_g ?? 0),
      fat_g: acc.fat_g + (m.fat_g ?? 0),
    }),
    { kcal: 0, carb_g: 0, protein_g: 0, fat_g: 0 },
  );
}
