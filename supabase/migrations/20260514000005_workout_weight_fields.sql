-- ============================================================================
-- workouts: 웨이트 트레이닝 측정 항목
-- ----------------------------------------------------------------------------
-- 부위·세트·총 reps·총 볼륨 (kg). 모두 nullable.
-- 추후 사진 업로드 → AI 자동 파싱 (Phase 3) 결과도 같은 컬럼에 들어감.
-- ============================================================================

alter table workouts add column body_parts text[];
alter table workouts add column total_sets int     check (total_sets is null or total_sets > 0);
alter table workouts add column total_reps int     check (total_reps is null or total_reps > 0);
alter table workouts add column volume_kg  numeric check (volume_kg is null or volume_kg >= 0);

comment on column workouts.body_parts is 'Weight-training muscle groups, e.g., {"chest","back"}.';
comment on column workouts.total_sets is 'Total sets across all exercises.';
comment on column workouts.total_reps is 'Total reps across all sets.';
comment on column workouts.volume_kg  is 'Total volume = sum(weight × reps) in kg.';
