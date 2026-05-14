-- ============================================================================
-- Seed: gear_rules presets
-- ----------------------------------------------------------------------------
-- Replacement guidance from PLAN.md §4. Editable by sysadmin; idempotent.
-- ============================================================================

insert into gear_rules
  (gear_type, display_name, category, recommended_km, warn_at_km, recommended_days, warn_at_days, linked_replace, notes)
values
  ('chain',                 '체인',                       'bike_part', 4000, 4000, null, null, null,                                                  '체인 마모는 변속·카세트 수명에 직결'),
  ('cassette',              '카세트(스프라켓)',           'bike_part', null, null, null, null, '[{"type":"chain","every_n_replaces":3}]'::jsonb,      '체인 3회 교체마다'),
  ('chainring',             '체인링',                     'bike_part', null, null, null, null, '[{"type":"chain","every_n_replaces":4}]'::jsonb,      '체인 4–5회 교체마다'),
  ('brake_pad_disc_resin',  '브레이크 패드 (디스크/레진)', 'bike_part', 2500, 2000, null, null, null,                                                  '비/오프로드면 더 빠름'),
  ('brake_pad_disc_metal',  '브레이크 패드 (디스크/메탈)', 'bike_part', 6000, 5000, null, null, null,                                                  null),
  ('brake_pad_rim',         '브레이크 패드 (림)',          'bike_part', 3500, 3000, null, null, null,                                                  null),
  ('tire_front',            '타이어 (전)',                 'bike_part', 5000, 5000, null, null, null,                                                  null),
  ('tire_rear',             '타이어 (후)',                 'bike_part', 3000, 3000, null, null, null,                                                  '후륜이 더 빨리 닳음'),
  ('bar_tape',              '바테이프',                    'bike_part', null, null, 365,  365,  null,                                                  '1년 또는 닳으면'),
  ('cable_housing',         '케이블/하우징',               'bike_part', 10000, null, 365, null, null,                                                  '연 1회 또는 1만 km'),
  ('bottom_bracket',        'BB (바텀브라켓)',             'bike_part', 10000, 10000, null, null, null,                                                  null),
  ('shoes_training',        '러닝화 (일반)',               'shoe',      700,  600,  null, null, null,                                                  null),
  ('shoes_carbon',          '러닝화 (카본 레이싱)',        'shoe',      350,  300,  null, null, null,                                                  '카본 플레이트는 마모 빠름'),
  ('goggle_seals',          '수경 패킹',                   'swim',      null, null, 180,  180,  null,                                                  '6개월 주기 권장')
on conflict (gear_type) do nothing;
