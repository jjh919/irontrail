-- ============================================================================
-- user_id default = auth.uid()
-- ----------------------------------------------------------------------------
-- With this, INSERTs from authenticated sessions can omit user_id and it'll
-- auto-populate from the JWT. Service-role contexts still must pass user_id
-- explicitly (auth.uid() returns NULL there).
-- ============================================================================

alter table races               alter column user_id set default auth.uid();
alter table training_plans      alter column user_id set default auth.uid();
alter table planned_workouts    alter column user_id set default auth.uid();
alter table workouts            alter column user_id set default auth.uid();
alter table meals               alter column user_id set default auth.uid();
alter table daily_checks        alter column user_id set default auth.uid();
alter table gear                alter column user_id set default auth.uid();
alter table gear_replacements   alter column user_id set default auth.uid();
alter table user_integrations   alter column user_id set default auth.uid();
alter table import_jobs         alter column user_id set default auth.uid();
alter table prs                 alter column user_id set default auth.uid();
alter table pain_logs           alter column user_id set default auth.uid();
