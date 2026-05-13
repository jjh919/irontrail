# IronTrail — 철인3종 훈련 & 영양 트래킹 웹앱 기획서

> **제품명**: IronTrail
> "철의 길을 걷고, 그 흔적을 남기다" — 철인이 되어가는 여정과 그 기록

> 최종 업데이트: 2026-05-13

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 제품명 | **IronTrail** |
| 목적 | 대회일까지의 훈련·식사·컨디션을 한 곳에서 기록하고 AI가 분석·코칭 |
| 초기 사용자 | 본인 1인 |
| 확장성 | 멀티유저 전제로 설계 (Supabase Auth + Postgres RLS) |
| 플랫폼 | 모바일 우선 반응형 웹 (PWA로 설치 가능) |
| 핵심 가치 | ① 3초 안에 기록 ② 대회일 기준 자동 가이드 ③ 먹은 것 vs. 태운 것 한눈에 |

---

## 2. 핵심 기능

### 2.1 훈련 기록
- **3대 종목**: 수영 / 사이클 / 러닝 — 거리, 시간, 페이스, 평균 심박, RPE(주관적 강도 1–10), 메모
- **보조 운동**: 웨이트, 요가, 스트레칭 등 자유 카테고리
- **브릭 운동(Brick)**: 사이클→러닝 연결 훈련, 철인3종 특화
- **빠른 입력**: 자주 쓰는 세션을 템플릿으로 저장
- **소스 구분**: 수동 / Strava / CSV / 이미지

### 2.2 AI 훈련 계획 (Training Plan)
- **자동 생성**: 대회 정보 + 현재 수준 + 가능 시간 → Claude Sonnet 4.6이 주차별 플랜 생성
- **페이즈 자동 분배**: Base / Build / Peak / Taper
- **회복 주**: 매 4주차 자동 삽입
- **재생성 트리거**:
  - 부상 입력 시 → 해당 부위 부하 빼고 재계산
  - 3일 연속 누락 시 → 조정 제안
  - 1주 컨디션 평균 6/10 이하 → 강도 자동 하향
- **메인 화면**: 오늘 처방된 훈련 + 내일 미리보기

### 2.3 식사 기록 & 영양 분석
- **자유 텍스트 입력**: "현미밥 1공기, 닭가슴살 150g" → AI가 칼로리/탄단지 추정
- **사진 입력** (Phase 3): 음식 사진 → Claude Vision 파싱
- **운동량 연동**: 그날 소모 칼로리 대비 섭취 충분성 표시
- **타이밍 코칭**: 훈련 전/중/후 권장 영양 가이드
- **수분 기록**: +250ml 빠른 버튼
- **레이스 위크 카브로딩** (Phase 2)

### 2.4 대시보드 / 홈
- D-day 카운트다운 + 현재 페이즈
- 오늘 처방 훈련 (시작/건너뛰기 버튼)
- 컨디션 체크 (수면, 피로, 체중)
- 내일 미리보기
- 부품 교체 알림 카드

### 2.5 캘린더
- **주간/월간 토글**
  - **월간**: 한눈 보기 — 일별 종목 아이콘, 주차별 미니 요약
  - **주간**: 디테일 — 세션별 거리·시간·강도, 상단 주간 합계 + 종목 분포 막대
- **계획 vs 실제**: 회색=계획, 컬러=완료
- **요약 카드**: 총 시간·거리·TSS·종목 비율

### 2.6 분석 / 인사이트
- 종목 밸런스 파이
- 주간 볼륨 추이
- 개인 기록(PR) 자동 갱신
- CTL/ATL/TSB 차트 (Phase 2)

---

## 3. 대회 종류 구조

```
race_categories:
  triathlon  → [olympic, half(70.3), full(140.6)]    거리 고정
  marathon   → [10km, half(21.1km), full(42.2km)]    거리 고정
  cycling    → [gran_fondo, medio_fondo, custom]     거리 직접 입력
  custom     → 사용자 정의 (확장용)
```

- 같은 시즌에 여러 대회 등록 가능
- A/B/C 레이스 우선순위 — 메인 화면 D-day는 A 레이스 기준
- 이름·날짜·장소·목표 시간·메모 자유 입력

---

## 4. 장비 마일리지 (연쇄 교체 룰)

### 모델
```
gear { id, user_id, name, type, brand, model, 
       install_date, total_km, replaced_count, parent_gear_id }

gear_rules { type, recommended_km, max_km, 
             linked_replace: [{ type, every_n_replaces }] }
```

### 기본 룰 프리셋

| 부품 | 적정 교체 | 경고 | 연쇄 규칙 |
|---|---|---|---|
| 체인 | 3,000–5,000km | 4,000km | — |
| 카세트(스프라켓) | — | — | **체인 3회 교체마다** |
| 체인링 | — | — | **체인 4–5회 교체마다** |
| 브레이크 패드 (디스크/레진) | 1,500–3,000km | 2,000km | — |
| 브레이크 패드 (디스크/메탈) | 3,000–8,000km | 5,000km | — |
| 브레이크 패드 (림) | 2,000–5,000km | 3,000km | — |
| 타이어 (전) | 4,000–6,000km | 5,000km | — |
| 타이어 (후) | 2,500–4,000km | 3,000km | — |
| 바테이프 | 1년 또는 닳으면 | 1년 | — |
| 케이블/하우징 | 1년 / 10,000km | — | — |
| BB(바텀브라켓) | 5,000–15,000km | 10,000km | — |
| 러닝화 (일반) | 500–800km | 600km | — |
| 러닝화 (카본 레이싱) | 200–400km | 300km | — |
| 수경 패킹 | 6개월 | — | — |

### UX
- 자전거 등록 시 → 부품 자동 생성 (체인, 카세트, 패드 등)
- 라이딩 기록 시 → 해당 자전거 부품 km 자동 누적
- **체인 교체 입력 → "체인 3회 교체 누적. 카세트도 교체하셨나요?" 모달**
- 경고 시점 도달 → 홈 화면 카드 노출
- 룰은 사용자가 수정 가능

---

## 5. 외부 연동

### 5.1 Strava ✅ (정식 구현)
- 공식 API 무료, OAuth 표준
- 한도: 15분당 100 요청 / 일 1,000 요청
- **Webhook**: 활동 업로드되면 자동으로 우리 서버에 푸시
- 구현 흐름:
  ```
  [Strava 연결] → OAuth → 토큰 저장 → Webhook 등록 + 일일 폴링 백업
  ```
- 가민 사용자에겐 "가민→스트라바 자동 동기화 켜세요" 안내

### 5.2 삼성 헬스 (Phase 2/3)
- **이미지 분석**: 활동 스크린샷 → Claude Vision (Haiku 4.5) → 파싱 → 확인 모달 → 저장
- **CSV 일괄 업로드**: 삼성헬스 데이터 내보내기 → `com.samsung.shealth.exercise.csv` 파싱

### 5.3 가민 / 기타 — 보류
- 공식 API 승인 어려움
- 가민→스트라바 경유로 대체

---

## 6. 기능 우선순위

### 🔴 Must (MVP)
- 운동/식사/컨디션 수동 기록
- 대회 등록 (3카테고리 × 서브타입)
- AI 훈련 계획 생성 + 메인 화면 "오늘 훈련"
- 캘린더 주간/월간 토글 + 요약
- 계획 vs 실제 비교
- 브릭 운동
- 컨디션 체크인
- D-day & 페이즈
- 장비 마일리지 (연쇄 교체 규칙 포함)
- 인증 + RLS

### 🟡 Should (Phase 2)
- Strava 연동
- CTL/ATL/TSB 차트
- 종목별 페이스 존 (CSS, LT, FTP)
- 개인 기록(PR) 자동 트래킹
- 부상/통증 로그
- 수분·전해질
- 레이스 위크 카브로딩 모드
- 식사 텍스트 AI 파싱

### 🟢 Could (Phase 3+)
- 사진 식사 입력 (Vision)
- 삼성헬스 CSV 업로드
- 삼성헬스 이미지 분석
- A/B/C 레이스 분류
- 대회 체크리스트
- HRV / 안정시 심박
- 목표 다이어리 / 회고
- 날씨 자동 기록

### ❌ 보류
- GPX 업로드
- 가민 직접 연동

---

## 7. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** | Server Actions로 인증된 데이터 안전 처리 |
| UI | Tailwind CSS + shadcn/ui | 빠른 모바일 UI |
| 호스팅 | Vercel Hobby | 본인 사용 동안 무료, Pro $20/mo로 확장 |
| DB | **Supabase Postgres** | 관계형 데이터에 적합 |
| 인증 | **Supabase Auth** | Google/Apple/Email, 무료 50k MAU |
| 보안 | **Postgres RLS** | DB 레벨에서 멀티유저 격리 |
| 스토리지 | Supabase Storage | 식사·헬스 스크린샷 |
| 백그라운드 | Vercel Cron | Strava 폴링, 주간 리포트 |
| AI 추론 | **Claude Sonnet 4.6** | 훈련 계획 생성, 주간 분석 |
| AI 경량 | **Claude Haiku 4.5** | 식사 파싱, 이미지 분석 |
| PWA | next-pwa | 오프라인 + 홈화면 설치 |

### 비용 시나리오

| 단계 | 사용자 | 월 비용 |
|---|---|---|
| MVP, 본인만 | 1 | $0–3 (Claude API만) |
| 친구 5–10명 | 10 | $5–15 |
| 100명 베타 | 100 | $25–40 (Supabase Pro) |
| 1,000명+ | 1,000 | $80–150 (Vercel Pro 추가) |

---

## 8. 데이터 모델 (초안)

```sql
-- 멀티유저 필수
auth.users (Supabase 제공)

-- 대회
races (
  id uuid pk,
  user_id uuid fk,
  name text,
  category text,        -- triathlon | marathon | cycling | custom
  sub_type text,        -- olympic | half | full | 10km | gran_fondo | ...
  distance_km numeric,  -- custom일 때만
  date date,
  location text,
  target_time interval,
  priority text,        -- A | B | C
  notes text
)

-- 훈련 계획
training_plans (
  id uuid pk, user_id uuid fk, race_id uuid fk,
  generated_at timestamptz, generator text  -- ai | manual
)
planned_workouts (
  id uuid pk, plan_id uuid fk, user_id uuid fk,
  date date, sport text, phase text,
  target_distance numeric, target_duration interval,
  intensity int, description text, completed_workout_id uuid
)

-- 실제 운동
workouts (
  id uuid pk, user_id uuid fk,
  date date, sport text,
  duration interval, distance numeric,
  avg_hr int, max_hr int, rpe int,
  notes text,
  source text,          -- manual | strava | csv | image
  external_id text,     -- 중복 import 방지
  is_brick boolean,
  parent_workout_id uuid -- 브릭에서 첫 번째 종목
)

-- 식사
meals (
  id uuid pk, user_id uuid fk,
  datetime timestamptz,
  raw_text text,
  kcal numeric, carb_g numeric, protein_g numeric, fat_g numeric,
  ai_parsed boolean, image_url text
)

-- 컨디션
daily_checks (
  user_id uuid, date date,
  sleep_h numeric, fatigue int, weight_kg numeric, mood int,
  primary key (user_id, date)
)

-- 장비
gear (
  id uuid pk, user_id uuid fk,
  name text, type text,
  brand text, model text,
  install_date date, total_km numeric,
  replaced_count int,
  parent_gear_id uuid   -- 자전거-부품 관계
)
gear_replacements (
  id uuid pk, gear_id uuid fk,
  replaced_at date, km_at_replace numeric, cost numeric, notes text
)

-- 외부 연동
user_integrations (
  user_id uuid, provider text,  -- strava | samsung
  access_token text, refresh_token text, expires_at timestamptz,
  external_user_id text, last_sync_at timestamptz,
  primary key (user_id, provider)
)

-- 비동기 작업
import_jobs (
  id uuid pk, user_id uuid fk,
  source text, status text, payload jsonb, created_at timestamptz
)

-- 부상/통증 (Phase 2)
pain_logs (
  id uuid pk, user_id uuid fk,
  date date, body_part text, severity int,
  note text, related_workout_id uuid
)

-- PR (Phase 2)
prs (
  id uuid pk, user_id uuid fk,
  sport text, distance numeric, time interval,
  date date, workout_id uuid
)
```

모든 테이블 RLS 활성화: `auth.uid() = user_id`

---

## 9. 화면 구성

| 탭 | 화면 | 핵심 컨텐츠 |
|---|---|---|
| 🏠 홈 | 메인 | D-day, 오늘 훈련, 컨디션 체크, 내일 미리보기, 부품 알림 |
| 📅 캘린더 | 주간/월간 토글 | 요약 카드 + 일별 세션, 계획 vs 실제 |
| ➕ 기록 | 빠른 입력 | 운동/식사/컨디션 — 큰 버튼 3개 |
| 📊 분석 | 인사이트 | CTL/ATL, 종목 밸런스, PR, 영양 |
| ⚙️ 설정 | 대회·존·장비·연동 | Strava 연결, 부품 룰 편집 |

### UX 원칙
- 하단 탭 네비게이션
- 메인 가운데 큰 "+" 버튼 → 운동/식사 빠른 입력
- 입력 폼은 한 화면 안에 (스크롤 X)
- 다크 모드 기본

---

## 10. 폴더 구조

```
my-app/
├── app/
│   ├── (auth)/login, signup
│   ├── (main)/
│   │   ├── page.tsx           # 홈
│   │   ├── calendar/
│   │   ├── log/
│   │   ├── analysis/
│   │   └── settings/
│   └── api/
│       ├── strava/callback
│       ├── strava/webhook
│       ├── ai/plan
│       └── ai/parse-meal
├── lib/
│   ├── supabase/
│   ├── claude/
│   └── strava/
├── components/
└── supabase/
    └── migrations/
```

---

## 11. 개발 로드맵

| Phase | 기간 | 범위 |
|---|---|---|
| **MVP** | 2–3주 | Must 항목 전체 + 인증 + RLS + 캘린더 + 장비 |
| **Phase 2** | 2주 | Strava 연동, AI 식사 파싱, CTL/ATL, PR, 부상 로그 |
| **Phase 3** | 2주 | Vision 식사·삼성헬스 이미지, 카브로딩, HRV |
| **Phase 4** | 옵션 | A/B/C 레이스, 체크리스트, 목표 다이어리 |

---

## 12. 다음 단계

1. Supabase 계정 + 프로젝트 생성 → URL/API 키 확보
2. Anthropic API 키 확보
3. Strava 앱 등록 (Phase 2 직전에 해도 됨)
4. `npx create-next-app` 으로 프로젝트 셋업
5. Supabase 마이그레이션 작성 (스키마 + RLS)
6. 인증 → 홈 → 운동 기록 폼 순서로 MVP 골격
