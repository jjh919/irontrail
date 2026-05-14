// ============================================================================
// IronTrail · Database types
// ----------------------------------------------------------------------------
// Hand-maintained to mirror supabase/migrations/*.sql.
// Structured to match the supabase-js `GenericSchema` contract so that
// `.from(table).insert(...)` etc. infer correctly.
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Sport = "swim" | "bike" | "run" | "weight" | "other";
export type TrainingPhase = "base" | "build" | "peak" | "taper" | "recovery" | "off";
export type RaceCategory = "triathlon" | "marathon" | "cycling" | "custom";
export type RacePriority = "A" | "B" | "C";
export type WorkoutSource = "manual" | "strava" | "csv" | "image";
export type PlanGenerator = "ai" | "manual" | "template";
export type IntegrationProvider = "strava" | "samsung_health";
export type ImportStatus = "pending" | "processing" | "completed" | "failed";
export type MealType =
  | "breakfast"
  | "lunch"
  | "snack"
  | "dinner"
  | "pre"
  | "during"
  | "post";
export type GearCategory = "bike_part" | "shoe" | "swim" | "other";
export type ImportJobSource = "strava" | "csv" | "image" | "fit";

// ============================================================================
// races
// ============================================================================
type RacesRow = {
  id: string;
  user_id: string;
  name: string;
  category: RaceCategory;
  sub_type: string | null;
  distance_km: number | null;
  race_date: string;
  location: string | null;
  target_time: string | null;
  priority: RacePriority;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type RacesInsert = {
  id?: string;
  user_id?: string;
  name: string;
  category: RaceCategory;
  sub_type?: string | null;
  distance_km?: number | null;
  race_date: string;
  location?: string | null;
  target_time?: string | null;
  priority?: RacePriority;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};
type RacesUpdate = {
  id?: string;
  user_id?: string;
  name?: string;
  category?: RaceCategory;
  sub_type?: string | null;
  distance_km?: number | null;
  race_date?: string;
  location?: string | null;
  target_time?: string | null;
  priority?: RacePriority;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// training_plans
// ============================================================================
type TrainingPlansRow = {
  id: string;
  user_id: string;
  race_id: string | null;
  generator: PlanGenerator;
  generated_at: string;
  meta: Json | null;
  is_active: boolean;
  created_at: string;
};
type TrainingPlansInsert = {
  id?: string;
  user_id?: string;
  race_id?: string | null;
  generator?: PlanGenerator;
  generated_at?: string;
  meta?: Json | null;
  is_active?: boolean;
  created_at?: string;
};
type TrainingPlansUpdate = Partial<TrainingPlansInsert>;

// ============================================================================
// planned_workouts
// ============================================================================
type PlannedWorkoutsRow = {
  id: string;
  plan_id: string;
  user_id: string;
  planned_date: string;
  sport: Sport;
  phase: TrainingPhase | null;
  target_distance_km: number | null;
  target_duration: string | null;
  intensity: number | null;
  description: string | null;
  completed_workout_id: string | null;
  created_at: string;
};
type PlannedWorkoutsInsert = {
  id?: string;
  plan_id: string;
  user_id?: string;
  planned_date: string;
  sport: Sport;
  phase?: TrainingPhase | null;
  target_distance_km?: number | null;
  target_duration?: string | null;
  intensity?: number | null;
  description?: string | null;
  completed_workout_id?: string | null;
  created_at?: string;
};
type PlannedWorkoutsUpdate = Partial<PlannedWorkoutsInsert>;

// ============================================================================
// workouts
// ============================================================================
type WorkoutsRow = {
  id: string;
  user_id: string;
  workout_date: string;
  sport: Sport;
  duration: string | null;
  distance_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  rpe: number | null;
  notes: string | null;
  source: WorkoutSource;
  external_id: string | null;
  is_brick: boolean;
  parent_workout_id: string | null;
  gear_id: string | null;
  avg_pace_s: number | null;
  avg_speed_kmh: number | null;
  elevation_gain_m: number | null;
  avg_cadence: number | null;
  avg_power_w: number | null;
  pool_length_m: number | null;
  stroke_style: string | null;
  created_at: string;
  updated_at: string;
};
type WorkoutsInsert = {
  id?: string;
  user_id?: string;
  workout_date: string;
  sport: Sport;
  duration?: string | null;
  distance_km?: number | null;
  avg_hr?: number | null;
  max_hr?: number | null;
  rpe?: number | null;
  notes?: string | null;
  source?: WorkoutSource;
  external_id?: string | null;
  is_brick?: boolean;
  parent_workout_id?: string | null;
  gear_id?: string | null;
  avg_pace_s?: number | null;
  avg_speed_kmh?: number | null;
  elevation_gain_m?: number | null;
  avg_cadence?: number | null;
  avg_power_w?: number | null;
  pool_length_m?: number | null;
  stroke_style?: string | null;
  created_at?: string;
  updated_at?: string;
};
type WorkoutsUpdate = Partial<WorkoutsInsert>;

// ============================================================================
// meals
// ============================================================================
type MealsRow = {
  id: string;
  user_id: string;
  eaten_at: string;
  meal_type: MealType | null;
  raw_text: string | null;
  kcal: number | null;
  carb_g: number | null;
  protein_g: number | null;
  fat_g: number | null;
  ai_parsed: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};
type MealsInsert = {
  id?: string;
  user_id?: string;
  eaten_at: string;
  meal_type?: MealType | null;
  raw_text?: string | null;
  kcal?: number | null;
  carb_g?: number | null;
  protein_g?: number | null;
  fat_g?: number | null;
  ai_parsed?: boolean;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};
type MealsUpdate = Partial<MealsInsert>;

// ============================================================================
// daily_checks  (composite PK: user_id + check_date)
// ============================================================================
type DailyChecksRow = {
  user_id: string;
  check_date: string;
  sleep_h: number | null;
  fatigue: number | null;
  weight_kg: number | null;
  mood: number | null;
  hydration_ml: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type DailyChecksInsert = {
  user_id?: string;
  check_date: string;
  sleep_h?: number | null;
  fatigue?: number | null;
  weight_kg?: number | null;
  mood?: number | null;
  hydration_ml?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};
type DailyChecksUpdate = Partial<DailyChecksInsert>;

// ============================================================================
// gear_rules  (public read-only catalog)
// ============================================================================
type GearRulesRow = {
  gear_type: string;
  display_name: string;
  category: GearCategory;
  recommended_km: number | null;
  warn_at_km: number | null;
  recommended_days: number | null;
  warn_at_days: number | null;
  linked_replace: Json | null;
  notes: string | null;
};
type GearRulesInsert = {
  gear_type: string;
  display_name: string;
  category: GearCategory;
  recommended_km?: number | null;
  warn_at_km?: number | null;
  recommended_days?: number | null;
  warn_at_days?: number | null;
  linked_replace?: Json | null;
  notes?: string | null;
};
type GearRulesUpdate = Partial<GearRulesInsert>;

// ============================================================================
// gear
// ============================================================================
type GearRow = {
  id: string;
  user_id: string;
  name: string;
  gear_type: string;
  brand: string | null;
  model: string | null;
  install_date: string | null;
  total_km: number;
  total_days: number | null;
  replaced_count: number;
  parent_gear_id: string | null;
  is_retired: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type GearInsert = {
  id?: string;
  user_id?: string;
  name: string;
  gear_type: string;
  brand?: string | null;
  model?: string | null;
  install_date?: string | null;
  total_km?: number;
  total_days?: number | null;
  replaced_count?: number;
  parent_gear_id?: string | null;
  is_retired?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};
type GearUpdate = Partial<GearInsert>;

// ============================================================================
// gear_replacements
// ============================================================================
type GearReplacementsRow = {
  id: string;
  gear_id: string;
  user_id: string;
  replaced_on: string;
  km_at_replace: number | null;
  cost_krw: number | null;
  notes: string | null;
  created_at: string;
};
type GearReplacementsInsert = {
  id?: string;
  gear_id: string;
  user_id?: string;
  replaced_on?: string;
  km_at_replace?: number | null;
  cost_krw?: number | null;
  notes?: string | null;
  created_at?: string;
};
type GearReplacementsUpdate = Partial<GearReplacementsInsert>;

// ============================================================================
// user_integrations  (composite PK: user_id + provider)
// ============================================================================
type UserIntegrationsRow = {
  user_id: string;
  provider: IntegrationProvider;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  external_user_id: string | null;
  meta: Json | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};
type UserIntegrationsInsert = {
  user_id?: string;
  provider: IntegrationProvider;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
  external_user_id?: string | null;
  meta?: Json | null;
  last_sync_at?: string | null;
  created_at?: string;
  updated_at?: string;
};
type UserIntegrationsUpdate = Partial<UserIntegrationsInsert>;

// ============================================================================
// import_jobs
// ============================================================================
type ImportJobsRow = {
  id: string;
  user_id: string;
  source: ImportJobSource;
  status: ImportStatus;
  payload: Json | null;
  result: Json | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};
type ImportJobsInsert = {
  id?: string;
  user_id?: string;
  source: ImportJobSource;
  status?: ImportStatus;
  payload?: Json | null;
  result?: Json | null;
  error?: string | null;
  created_at?: string;
  completed_at?: string | null;
};
type ImportJobsUpdate = Partial<ImportJobsInsert>;

// ============================================================================
// prs (Personal Records — Phase 2 table, present now)
// ============================================================================
type PrsRow = {
  id: string;
  user_id: string;
  sport: Sport;
  distance_km: number;
  best_time: string;
  achieved_on: string;
  workout_id: string | null;
  created_at: string;
};
type PrsInsert = {
  id?: string;
  user_id?: string;
  sport: Sport;
  distance_km: number;
  best_time: string;
  achieved_on: string;
  workout_id?: string | null;
  created_at?: string;
};
type PrsUpdate = Partial<PrsInsert>;

// ============================================================================
// pain_logs (Phase 2 table, present now)
// ============================================================================
type PainLogsRow = {
  id: string;
  user_id: string;
  logged_on: string;
  body_part: string;
  severity: number;
  note: string | null;
  related_workout_id: string | null;
  created_at: string;
};
type PainLogsInsert = {
  id?: string;
  user_id?: string;
  logged_on: string;
  body_part: string;
  severity: number;
  note?: string | null;
  related_workout_id?: string | null;
  created_at?: string;
};
type PainLogsUpdate = Partial<PainLogsInsert>;

// ============================================================================
// Database — assembled
// ============================================================================
export interface Database {
  public: {
    Tables: {
      races: { Row: RacesRow; Insert: RacesInsert; Update: RacesUpdate; Relationships: [] };
      training_plans: { Row: TrainingPlansRow; Insert: TrainingPlansInsert; Update: TrainingPlansUpdate; Relationships: [] };
      planned_workouts: { Row: PlannedWorkoutsRow; Insert: PlannedWorkoutsInsert; Update: PlannedWorkoutsUpdate; Relationships: [] };
      workouts: { Row: WorkoutsRow; Insert: WorkoutsInsert; Update: WorkoutsUpdate; Relationships: [] };
      meals: { Row: MealsRow; Insert: MealsInsert; Update: MealsUpdate; Relationships: [] };
      daily_checks: { Row: DailyChecksRow; Insert: DailyChecksInsert; Update: DailyChecksUpdate; Relationships: [] };
      gear_rules: { Row: GearRulesRow; Insert: GearRulesInsert; Update: GearRulesUpdate; Relationships: [] };
      gear: { Row: GearRow; Insert: GearInsert; Update: GearUpdate; Relationships: [] };
      gear_replacements: { Row: GearReplacementsRow; Insert: GearReplacementsInsert; Update: GearReplacementsUpdate; Relationships: [] };
      user_integrations: { Row: UserIntegrationsRow; Insert: UserIntegrationsInsert; Update: UserIntegrationsUpdate; Relationships: [] };
      import_jobs: { Row: ImportJobsRow; Insert: ImportJobsInsert; Update: ImportJobsUpdate; Relationships: [] };
      prs: { Row: PrsRow; Insert: PrsInsert; Update: PrsUpdate; Relationships: [] };
      pain_logs: { Row: PainLogsRow; Insert: PainLogsInsert; Update: PainLogsUpdate; Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
    Enums: {
      sport: Sport;
      training_phase: TrainingPhase;
      race_category: RaceCategory;
      race_priority: RacePriority;
      workout_source: WorkoutSource;
      plan_generator: PlanGenerator;
      integration_provider: IntegrationProvider;
      import_status: ImportStatus;
    };
  };
}

// ----------------------------------------------------------------------------
// Convenience aliases
// ----------------------------------------------------------------------------
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
