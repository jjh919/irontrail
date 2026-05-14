-- ============================================================================
-- workouts: 종목별 측정 항목 컬럼 추가
-- ----------------------------------------------------------------------------
-- 모두 nullable — 사용자가 알고/원하는 만큼만 채워도 됨.
-- avg_pace_s 의 단위는 종목별로 다름 (per-100m for swim, per-km for run).
-- ============================================================================

alter table workouts add column avg_pace_s       int     check (avg_pace_s is null or avg_pace_s > 0);
alter table workouts add column avg_speed_kmh    numeric check (avg_speed_kmh is null or avg_speed_kmh >= 0);
alter table workouts add column elevation_gain_m int     check (elevation_gain_m is null or elevation_gain_m >= 0);
alter table workouts add column avg_cadence      int     check (avg_cadence is null or avg_cadence > 0);
alter table workouts add column avg_power_w      int     check (avg_power_w is null or avg_power_w >= 0);
alter table workouts add column pool_length_m    int     check (pool_length_m is null or pool_length_m > 0);
alter table workouts add column stroke_style     text;

comment on column workouts.avg_pace_s       is 'Seconds per unit. Per-km for run, per-100m for swim.';
comment on column workouts.avg_speed_kmh    is 'Average speed in km/h. Mainly cycling.';
comment on column workouts.elevation_gain_m is 'Cumulative elevation gain in meters.';
comment on column workouts.avg_cadence      is 'Average cadence: rpm (bike) or spm (run).';
comment on column workouts.avg_power_w      is 'Average power in watts. Cycling.';
comment on column workouts.pool_length_m    is 'Pool length 25/50, or null for open water. Swim.';
comment on column workouts.stroke_style     is 'Swim stroke style.';
