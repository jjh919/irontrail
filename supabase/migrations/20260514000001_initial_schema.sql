-- ============================================================================
-- IronTrail · Initial Schema
-- ============================================================================
-- Design principles:
--   1. Multi-user from day one — every user-owned table has user_id + RLS.
--   2. RLS policies use auth.uid() = user_id (Supabase Auth).
--   3. ON DELETE CASCADE from auth.users so deleting a user cleans up all data.
--   4. created_at + updated_at on mutable tables, with set_updated_at trigger.
--   5. Enums for stable categorical values, text+check for evolving ones.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

create type sport as enum ('swim', 'bike', 'run', 'weight', 'other');
create type training_phase as enum ('base', 'build', 'peak', 'taper', 'recovery', 'off');
create type race_category as enum ('triathlon', 'marathon', 'cycling', 'custom');
create type race_priority as enum ('A', 'B', 'C');
create type workout_source as enum ('manual', 'strava', 'csv', 'image');
create type plan_generator as enum ('ai', 'manual', 'template');
create type integration_provider as enum ('strava', 'samsung_health');
create type import_status as enum ('pending', 'processing', 'completed', 'failed');

-- ============================================================================
-- HELPER: updated_at trigger function
-- ============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. RACES
-- ============================================================================

create table races (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  category     race_category not null,
  sub_type     text,                                        -- olympic | half | full | 10km | gran_fondo | medio_fondo | custom
  distance_km  numeric check (distance_km is null or distance_km > 0),
  race_date    date not null,
  location     text,
  target_time  interval,
  priority     race_priority not null default 'B',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index races_user_date_idx on races(user_id, race_date);

create trigger races_updated_at before update on races
  for each row execute function set_updated_at();

alter table races enable row level security;

create policy "own races" on races
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 2. TRAINING PLANS + PLANNED WORKOUTS + WORKOUTS
-- ============================================================================

create table training_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  race_id      uuid references races(id) on delete cascade,
  generator    plan_generator not null default 'ai',
  generated_at timestamptz not null default now(),
  meta         jsonb,                                       -- AI prompt inputs, model version, etc.
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index training_plans_user_active_idx on training_plans(user_id, is_active);

alter table training_plans enable row level security;

create policy "own training_plans" on training_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create workouts first so planned_workouts can reference completed_workout_id.
create table workouts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  workout_date      date not null,
  sport             sport not null,
  duration          interval,
  distance_km       numeric check (distance_km is null or distance_km >= 0),
  avg_hr            int check (avg_hr is null or (avg_hr > 0 and avg_hr < 250)),
  max_hr            int check (max_hr is null or (max_hr > 0 and max_hr < 250)),
  rpe               int check (rpe is null or (rpe between 1 and 10)),
  notes             text,
  source            workout_source not null default 'manual',
  external_id       text,                                   -- e.g., Strava activity id, for dedup
  is_brick          boolean not null default false,
  parent_workout_id uuid references workouts(id) on delete set null,
  gear_id           uuid,                                   -- FK added after gear table exists
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index workouts_user_date_idx on workouts(user_id, workout_date desc);
create unique index workouts_external_uniq on workouts(user_id, source, external_id)
  where external_id is not null;

create trigger workouts_updated_at before update on workouts
  for each row execute function set_updated_at();

alter table workouts enable row level security;

create policy "own workouts" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Now planned_workouts can FK into workouts.
create table planned_workouts (
  id                   uuid primary key default gen_random_uuid(),
  plan_id              uuid not null references training_plans(id) on delete cascade,
  user_id              uuid not null references auth.users(id) on delete cascade,
  planned_date         date not null,
  sport                sport not null,
  phase                training_phase,
  target_distance_km   numeric check (target_distance_km is null or target_distance_km >= 0),
  target_duration      interval,
  intensity            int check (intensity is null or (intensity between 1 and 5)),
  description          text,
  completed_workout_id uuid references workouts(id) on delete set null,
  created_at           timestamptz not null default now()
);

create index planned_workouts_user_date_idx on planned_workouts(user_id, planned_date);
create index planned_workouts_plan_idx on planned_workouts(plan_id);

alter table planned_workouts enable row level security;

create policy "own planned_workouts" on planned_workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 3. NUTRITION (meals + daily_checks)
-- ============================================================================

create table meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  eaten_at   timestamptz not null,
  meal_type  text check (meal_type in ('breakfast','lunch','snack','dinner','pre','during','post')),
  raw_text   text,
  kcal       numeric check (kcal is null or kcal >= 0),
  carb_g     numeric check (carb_g is null or carb_g >= 0),
  protein_g  numeric check (protein_g is null or protein_g >= 0),
  fat_g      numeric check (fat_g is null or fat_g >= 0),
  ai_parsed  boolean not null default false,
  image_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meals_user_date_idx on meals(user_id, eaten_at desc);

create trigger meals_updated_at before update on meals
  for each row execute function set_updated_at();

alter table meals enable row level security;

create policy "own meals" on meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily checks: composite PK ensures one row per user per day.
create table daily_checks (
  user_id      uuid not null references auth.users(id) on delete cascade,
  check_date   date not null,
  sleep_h      numeric check (sleep_h is null or (sleep_h >= 0 and sleep_h <= 24)),
  fatigue      int check (fatigue is null or (fatigue between 1 and 10)),
  weight_kg    numeric check (weight_kg is null or weight_kg > 0),
  mood         int check (mood is null or (mood between 1 and 10)),
  hydration_ml int check (hydration_ml is null or hydration_ml >= 0),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, check_date)
);

create trigger daily_checks_updated_at before update on daily_checks
  for each row execute function set_updated_at();

alter table daily_checks enable row level security;

create policy "own daily_checks" on daily_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 4. GEAR (Equipment + replacement rules)
-- ============================================================================

-- Shared/public catalog of gear types and their replacement rules.
-- No user_id — accessible to all authenticated users (read-only).
create table gear_rules (
  gear_type        text primary key,                        -- 'chain', 'cassette', 'brake_pad_disc_metal', ...
  display_name     text not null,
  category         text not null check (category in ('bike_part','shoe','swim','other')),
  recommended_km   numeric,                                 -- ideal replacement km
  warn_at_km       numeric,                                 -- warn user at this km
  recommended_days int,                                     -- for time-based parts
  warn_at_days     int,
  linked_replace   jsonb,                                   -- [{"type":"chain","every_n_replaces":3}, ...]
  notes            text
);

alter table gear_rules enable row level security;

create policy "gear_rules readable" on gear_rules
  for select using (auth.role() = 'authenticated');

-- User-owned gear (bike, shoes, etc.). Parent-child for bike → components.
create table gear (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  gear_type      text not null references gear_rules(gear_type),
  brand          text,
  model          text,
  install_date   date,
  total_km       numeric not null default 0,
  total_days     int,
  replaced_count int not null default 0,
  parent_gear_id uuid references gear(id) on delete cascade,
  is_retired     boolean not null default false,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index gear_user_idx on gear(user_id);
create index gear_parent_idx on gear(parent_gear_id);

create trigger gear_updated_at before update on gear
  for each row execute function set_updated_at();

alter table gear enable row level security;

create policy "own gear" on gear
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Backfill the FK from workouts.gear_id → gear.id now that gear exists.
alter table workouts
  add constraint workouts_gear_fk
  foreign key (gear_id) references gear(id) on delete set null;

create index workouts_gear_idx on workouts(gear_id) where gear_id is not null;

-- Replacement history: drives "replaced_count" increments and cost tracking.
create table gear_replacements (
  id            uuid primary key default gen_random_uuid(),
  gear_id       uuid not null references gear(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  replaced_on   date not null default current_date,
  km_at_replace numeric,
  cost_krw      numeric,
  notes         text,
  created_at    timestamptz not null default now()
);

create index gear_replacements_gear_idx on gear_replacements(gear_id);
create index gear_replacements_user_date_idx on gear_replacements(user_id, replaced_on desc);

alter table gear_replacements enable row level security;

create policy "own gear_replacements" on gear_replacements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 5. EXTERNAL INTEGRATIONS
-- ============================================================================

create table user_integrations (
  user_id          uuid not null references auth.users(id) on delete cascade,
  provider         integration_provider not null,
  access_token     text,
  refresh_token    text,
  expires_at       timestamptz,
  external_user_id text,
  meta             jsonb,
  last_sync_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, provider)
);

create trigger user_integrations_updated_at before update on user_integrations
  for each row execute function set_updated_at();

alter table user_integrations enable row level security;

create policy "own integrations" on user_integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Async import jobs (Strava sync, CSV upload, image parse)
create table import_jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  source       text not null check (source in ('strava','csv','image','fit')),
  status       import_status not null default 'pending',
  payload      jsonb,
  result       jsonb,
  error        text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index import_jobs_user_status_idx on import_jobs(user_id, status, created_at desc);

alter table import_jobs enable row level security;

create policy "own import_jobs" on import_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 6. PHASE 2 — PRs + PAIN LOGS (forward-compat, tables ready now)
-- ============================================================================

create table prs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sport       sport not null,
  distance_km numeric not null check (distance_km > 0),
  best_time   interval not null,
  achieved_on date not null,
  workout_id  uuid references workouts(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index prs_user_sport_distance_idx on prs(user_id, sport, distance_km);

alter table prs enable row level security;

create policy "own prs" on prs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table pain_logs (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  logged_on          date not null,
  body_part          text not null,
  severity           int not null check (severity between 1 and 10),
  note               text,
  related_workout_id uuid references workouts(id) on delete set null,
  created_at         timestamptz not null default now()
);

create index pain_logs_user_date_idx on pain_logs(user_id, logged_on desc);

alter table pain_logs enable row level security;

create policy "own pain_logs" on pain_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
