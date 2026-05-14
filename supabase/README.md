# Supabase

IronTrail 데이터베이스 스키마. Postgres + RLS 기반, 멀티유저 전제.

## 구조

```
supabase/
└── migrations/
    ├── 20260514000001_initial_schema.sql   # 모든 테이블 + RLS + 인덱스
    └── 20260514000002_seed_gear_rules.sql  # 장비 교체 룰 시드 데이터
```

## 적용 방법

### 옵션 A — Supabase Dashboard (간편)
1. https://supabase.com → 프로젝트 → SQL Editor
2. 각 `.sql` 파일 내용 **timestamp 순서대로** 복사·실행

### 옵션 B — Supabase CLI (재현성 좋음)
```bash
npx supabase init               # 처음 한 번만
npx supabase link --project-ref <your-ref>
npx supabase db push            # 모든 마이그레이션 적용
```

## 핵심 규칙

- **모든 사용자 소유 테이블에 user_id + RLS** — `auth.uid() = user_id` 정책 강제
- `gear_rules`는 인증된 사용자 모두 read 가능 (공용 카탈로그)
- `auth.users` 삭제 시 모든 데이터 cascade 삭제
- 변경 가능한 테이블엔 `created_at` + `updated_at` (트리거 자동 갱신)

## 신규 마이그레이션 추가

파일명은 `YYYYMMDDHHMMSS_의미있는이름.sql` 형식. 기존 마이그레이션은 절대 수정하지 말고 새 파일로 추가.

```bash
# 예시
touch supabase/migrations/20260601120000_add_workout_weather.sql
```
