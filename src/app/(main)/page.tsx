import Link from "next/link";
import { Bell, Play } from "lucide-react";
import { getCurrentARace, dDayFromToday } from "@/lib/db/races";
import { getDailyCheck } from "@/lib/db/daily-checks";
import { getPlannedForDate } from "@/lib/db/training-plans";
import { listWorkouts } from "@/lib/db/workouts";
import { weekRange, todayISO, intervalToSeconds, formatDuration } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { sportConfig } from "@/lib/calendar";
import type { Workout } from "@/lib/db/workouts";

export default async function HomePage() {
  const today = todayISO();
  const wr = weekRange();

  const supabase = await createClient();
  const [{ data: userRes }, race, plannedToday, condition, weekWorkouts] =
    await Promise.all([
      supabase.auth.getUser(),
      getCurrentARace(),
      getPlannedForDate(today),
      getDailyCheck(today),
      listWorkouts({ from: wr.start, to: wr.end }),
    ]);

  const displayName = userRes.user?.email?.split("@")[0] ?? "사용자";
  const dDay = race ? dDayFromToday(race.race_date) : null;
  const dayDurations = bucketByDay(weekWorkouts, wr.start);
  const maxDayMin = Math.max(60, ...dayDurations.map((s) => s / 60));
  const todayIdx = todayIndex(wr.start, today);

  return (
    <div className="px-6 pt-8 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-zinc-500 text-xs">좋은 하루예요</div>
          <div className="text-white text-lg font-semibold mt-0.5">
            {displayName} <span className="text-amber-500">·</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="알림"
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 active:bg-zinc-800"
        >
          <Bell className="w-4 h-4" />
        </button>
      </header>

      {/* D-day hero */}
      {race && dDay !== null ? (
        <section className="forge-card rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-500/10 blur-xl" />
          <div className="absolute -right-2 top-2 text-amber-500 text-xs font-medium tracking-wide">
            {race.name}
          </div>
          <div className="text-zinc-500 text-xs mb-1 relative">대회까지</div>
          <div className="flex items-baseline gap-2 relative">
            <div className="font-mono text-white text-6xl font-bold tracking-tighter forge-num leading-none">
              {dDay >= 0 ? dDay : `+${Math.abs(dDay)}`}
            </div>
            <div className="text-zinc-400 text-sm">
              {dDay >= 0 ? "일 남았어요" : "일 전 종료"}
            </div>
          </div>
        </section>
      ) : (
        <Link
          href="/settings"
          className="block forge-card rounded-3xl p-6 border-dashed"
        >
          <div className="text-zinc-500 text-xs mb-1">대회 미등록</div>
          <div className="text-white text-base font-semibold">
            목표 대회를 등록해보세요 →
          </div>
          <div className="text-zinc-500 text-xs mt-2">
            대회 정보가 있어야 D-day 카운트다운과 AI 훈련 계획 생성이 가능합니다
          </div>
        </Link>
      )}

      {/* Today's planned workout */}
      <section>
        <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3 px-1">
          오늘의 훈련
        </div>
        {plannedToday ? (
          <PlannedCard
            sport={plannedToday.sport}
            title={plannedToday.description ?? "오늘 처방"}
            duration={intervalToSeconds(plannedToday.target_duration)}
            distance={plannedToday.target_distance_km}
            intensity={plannedToday.intensity}
          />
        ) : (
          <div className="forge-card rounded-3xl p-5 text-center">
            <div className="text-zinc-400 text-sm">오늘은 처방된 훈련이 없어요</div>
            <div className="text-zinc-500 text-xs mt-1">
              회복일이거나, 아직 훈련 계획이 없습니다
            </div>
          </div>
        )}
      </section>

      {/* Condition */}
      <section>
        <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3 px-1">
          오늘 컨디션
        </div>
        <Link
          href="/log/condition"
          className="forge-card rounded-3xl p-5 flex items-center justify-around active:bg-zinc-900/50 transition"
        >
          <Stat
            emoji="😴"
            value={condition?.sleep_h?.toString() ?? "—"}
            unit="h"
            label="수면"
          />
          <div className="w-px h-10 bg-zinc-800" />
          <Stat
            emoji="⚡"
            value={condition?.fatigue?.toString() ?? "—"}
            unit="/10"
            label="피로"
          />
          <div className="w-px h-10 bg-zinc-800" />
          <Stat
            emoji="⚖️"
            value={condition?.weight_kg?.toString() ?? "—"}
            unit="kg"
            label="체중"
          />
        </Link>
        {!condition && (
          <div className="text-zinc-600 text-[11px] mt-2 px-2">
            카드를 탭해서 오늘 컨디션을 기록해보세요
          </div>
        )}
      </section>

      {/* Week progress */}
      <section className="forge-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-semibold">이번 주</div>
            <div className="text-zinc-500 text-xs mt-0.5">
              {weekWorkouts.length === 0
                ? "아직 기록된 운동이 없어요"
                : `${weekWorkouts.length}회 완료`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-amber-400 font-mono font-bold text-base">
              {formatDuration(dayDurations.reduce((a, b) => a + b, 0))}
            </div>
            <div className="text-zinc-500 text-[10px]">총 시간</div>
          </div>
        </div>

        <div className="flex justify-between items-end gap-1.5 mt-4">
          {dayDurations.map((sec, i) => {
            const minutes = sec / 60;
            const heightPct = (minutes / maxDayMin) * 100;
            const isToday = i === todayIdx;
            const dayName = ["월", "화", "수", "목", "금", "토", "일"][i];
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full rounded-lg transition ${
                    sec === 0
                      ? "h-2 bg-zinc-900 border border-zinc-800"
                      : isToday
                        ? "bg-amber-500 ring-2 ring-amber-500/30 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "bg-amber-500/60"
                  }`}
                  style={
                    sec > 0
                      ? { height: `${Math.max(8, heightPct * 0.6)}px` }
                      : undefined
                  }
                />
                <div
                  className={`text-[10px] font-mono ${
                    isToday ? "text-amber-400 font-bold" : "text-zinc-500"
                  }`}
                >
                  {dayName}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline components
// ---------------------------------------------------------------------------

function PlannedCard(props: {
  sport: "swim" | "bike" | "run" | "weight" | "other";
  title: string;
  duration: number;
  distance: number | null;
  intensity: number | null;
}) {
  const c = sportConfig[props.sport];
  const dur = props.duration > 0 ? formatDuration(props.duration) : null;
  const dist = props.distance != null ? `${props.distance}km` : null;

  return (
    <div className="forge-card rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border ${c.bg} ${c.border}`}
        >
          {c.emoji}
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-base">{props.title}</div>
          <div className="text-zinc-500 text-xs mt-0.5">
            {[dur, dist, props.intensity ? `강도 ${props.intensity}/5` : null]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          href="/log"
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <Play className="w-4 h-4" fill="currentColor" />
          시작하기
        </Link>
        <button
          type="button"
          disabled
          className="px-5 py-3.5 text-zinc-500 text-sm bg-zinc-900 border border-zinc-800 rounded-2xl"
        >
          미루기
        </button>
      </div>
    </div>
  );
}

function Stat({
  emoji,
  value,
  unit,
  label,
}: {
  emoji: string;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-white font-mono font-bold">
        {value}
        <span className="text-xs text-zinc-500 font-sans ml-0.5">{unit}</span>
      </div>
      <div className="text-zinc-500 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bucketByDay(workouts: Workout[], weekStart: string): number[] {
  const start = new Date(weekStart + "T00:00:00");
  const result = [0, 0, 0, 0, 0, 0, 0];
  for (const w of workouts) {
    const d = new Date(w.workout_date + "T00:00:00");
    const idx = Math.floor((d.getTime() - start.getTime()) / 86400000);
    if (idx >= 0 && idx < 7) {
      result[idx] += intervalToSeconds(w.duration);
    }
  }
  return result;
}

function todayIndex(weekStart: string, today: string): number {
  const start = new Date(weekStart + "T00:00:00").getTime();
  const t = new Date(today + "T00:00:00").getTime();
  return Math.floor((t - start) / 86400000);
}
