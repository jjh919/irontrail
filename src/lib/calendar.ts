// ============================================================================
// Calendar view-model
// ----------------------------------------------------------------------------
// Pure functions that turn DB rows (workouts + planned_workouts) into the
// shape the calendar UI components consume. No data fetching here.
// ============================================================================

import { toISODate, intervalToSeconds, formatDuration } from "@/lib/date";
import type { Sport } from "@/lib/supabase/database.types";
import type { Workout } from "@/lib/db/workouts";
import type { PlannedWorkout } from "@/lib/db/training-plans";

export type SessionStatus = "done" | "today" | "planned" | "rest" | "missed";

export interface CalendarSession {
  sports: Sport[];
  title: string;
  description?: string;
  isBrick: boolean;
}

export interface DayEntry {
  date: string;
  dayName: string;
  status: SessionStatus;
  session?: CalendarSession;
}

export interface MonthDay {
  day: number;
  status: "done" | "today" | "planned" | "rest" | "missed" | "brick";
  sports?: Sport[];
}

export interface SportBreakdown {
  sport: Sport;
  time: string;
  percent: number;
}

export interface WeekSummaryView {
  weekNumber: number;
  totalTime: string;
  totalDistance: string;
  totalTss: number;
  completed: number;
  planned: number;
  breakdown: SportBreakdown[];
  /** 7-day duration (seconds) for bar chart, Mon→Sun */
  dayDurations: number[];
}

const DAY_NAMES_KR = ["월", "화", "수", "목", "금", "토", "일"];

export const SPORT_LABELS: Record<Sport, string> = {
  swim: "수영",
  bike: "사이클",
  run: "러닝",
  weight: "웨이트",
  other: "기타",
};

export const sportConfig: Record<
  Sport,
  {
    emoji: string;
    label: string;
    bg: string;
    border: string;
    dot: string;
    bar: string;
  }
> = {
  swim: {
    emoji: "🏊",
    label: "수영",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    dot: "bg-sky-400",
    bar: "bg-sky-400",
  },
  bike: {
    emoji: "🚴",
    label: "사이클",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  run: {
    emoji: "🏃",
    label: "러닝",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    dot: "bg-rose-400",
    bar: "bg-rose-400",
  },
  weight: {
    emoji: "🏋️",
    label: "웨이트",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    dot: "bg-violet-400",
    bar: "bg-violet-400",
  },
  other: {
    emoji: "✨",
    label: "기타",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/20",
    dot: "bg-zinc-400",
    bar: "bg-zinc-400",
  },
};

// ---------------------------------------------------------------------------
// Week
// ---------------------------------------------------------------------------

export function buildWeekEntries(
  workouts: Workout[],
  planned: PlannedWorkout[],
  weekStart: string,
  today: string,
): DayEntry[] {
  const start = new Date(weekStart + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = toISODate(date);

    const dayWorkouts = workouts.filter((w) => w.workout_date === dateStr);
    const dayPlanned = planned.filter((p) => p.planned_date === dateStr);

    let status: SessionStatus;
    let session: CalendarSession | undefined;

    if (dayWorkouts.length > 0) {
      status = "done";
      session = sessionFromWorkouts(dayWorkouts);
    } else if (dateStr === today) {
      status = "today";
      if (dayPlanned.length > 0) session = sessionFromPlanned(dayPlanned);
    } else if (dateStr < today) {
      status = dayPlanned.length > 0 ? "missed" : "rest";
      if (dayPlanned.length > 0) session = sessionFromPlanned(dayPlanned);
    } else {
      status = dayPlanned.length > 0 ? "planned" : "rest";
      if (dayPlanned.length > 0) session = sessionFromPlanned(dayPlanned);
    }

    return { date: dateStr, dayName: DAY_NAMES_KR[i], status, session };
  });
}

function sessionFromWorkouts(workouts: Workout[]): CalendarSession {
  if (workouts.length === 1) {
    const w = workouts[0];
    return {
      sports: [w.sport],
      title: defaultTitle(w.sport),
      description: describeWorkout(w),
      isBrick: false,
    };
  }
  return {
    sports: workouts.map((w) => w.sport),
    title: "브릭 세션",
    description: workouts
      .map((w) => `${SPORT_LABELS[w.sport]} ${describeWorkout(w)}`)
      .join(" + "),
    isBrick: true,
  };
}

function sessionFromPlanned(planned: PlannedWorkout[]): CalendarSession {
  if (planned.length === 1) {
    const p = planned[0];
    return {
      sports: [p.sport],
      title: p.description ?? defaultTitle(p.sport),
      description: describePlanned(p),
      isBrick: false,
    };
  }
  return {
    sports: planned.map((p) => p.sport),
    title: "브릭 세션",
    description: planned
      .map((p) => SPORT_LABELS[p.sport])
      .join(" + "),
    isBrick: true,
  };
}

function describeWorkout(w: Workout): string {
  const parts: string[] = [];
  const sec = intervalToSeconds(w.duration);
  if (sec > 0) parts.push(formatDuration(sec));
  if (w.distance_km != null) parts.push(`${w.distance_km}km`);
  return parts.join(" · ");
}

function describePlanned(p: PlannedWorkout): string {
  const parts: string[] = [];
  const sec = intervalToSeconds(p.target_duration);
  if (sec > 0) parts.push(formatDuration(sec));
  if (p.target_distance_km != null) parts.push(`${p.target_distance_km}km`);
  if (p.intensity) parts.push(`강도 ${p.intensity}`);
  return parts.join(" · ");
}

function defaultTitle(sport: Sport): string {
  return `${SPORT_LABELS[sport]} 세션`;
}

export function buildWeekSummary(
  workouts: Workout[],
  planned: PlannedWorkout[],
  weekStart: string,
): WeekSummaryView {
  const start = new Date(weekStart + "T00:00:00");
  const dayDurations = Array(7).fill(0);
  let totalSec = 0;
  let totalKm = 0;
  const perSport: Record<Sport, { sec: number; km: number }> = {
    swim: { sec: 0, km: 0 },
    bike: { sec: 0, km: 0 },
    run: { sec: 0, km: 0 },
    weight: { sec: 0, km: 0 },
    other: { sec: 0, km: 0 },
  };

  for (const w of workouts) {
    const sec = intervalToSeconds(w.duration);
    const km = w.distance_km ?? 0;
    totalSec += sec;
    totalKm += km;
    perSport[w.sport].sec += sec;
    perSport[w.sport].km += km;
    const d = new Date(w.workout_date + "T00:00:00");
    const idx = Math.floor((d.getTime() - start.getTime()) / 86400000);
    if (idx >= 0 && idx < 7) dayDurations[idx] += sec;
  }

  const breakdown: SportBreakdown[] = (["swim", "bike", "run", "weight"] as Sport[])
    .map((s) => ({
      sport: s,
      time: formatDuration(perSport[s].sec),
      percent: totalSec > 0 ? (perSport[s].sec / totalSec) * 100 : 0,
    }))
    .filter((b) => b.percent > 0);

  return {
    weekNumber: weekNumberOf(start),
    totalTime: formatDuration(totalSec),
    totalDistance: `${totalKm.toFixed(0)} km`,
    totalTss: 0, // TODO when we have FTP/CSS/LT
    completed: workouts.length,
    planned: planned.length || workouts.length,
    breakdown,
    dayDurations,
  };
}

// ---------------------------------------------------------------------------
// Month
// ---------------------------------------------------------------------------

export function buildMonthDays(
  workouts: Workout[],
  planned: PlannedWorkout[],
  year: number,
  month: number, // 1-12
  today: string,
): MonthDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: MonthDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayWorkouts = workouts.filter((w) => w.workout_date === dateStr);
    const dayPlanned = planned.filter((p) => p.planned_date === dateStr);

    let status: MonthDay["status"];
    let sports: Sport[] | undefined;

    if (dateStr === today) {
      status = "today";
      sports =
        dayWorkouts.length > 0
          ? dayWorkouts.map((w) => w.sport)
          : dayPlanned.length > 0
            ? dayPlanned.map((p) => p.sport)
            : undefined;
    } else if (dayWorkouts.length > 1) {
      status = "brick";
      sports = dayWorkouts.map((w) => w.sport);
    } else if (dayWorkouts.length === 1) {
      status = "done";
      sports = [dayWorkouts[0].sport];
    } else if (dateStr < today) {
      status = dayPlanned.length > 0 ? "missed" : "rest";
    } else {
      if (dayPlanned.length > 1) {
        status = "brick";
        sports = dayPlanned.map((p) => p.sport);
      } else if (dayPlanned.length === 1) {
        status = "planned";
        sports = [dayPlanned[0].sport];
      } else {
        status = "rest";
      }
    }

    result.push({ day, status, sports });
  }

  return result;
}

/** Mon=0 ... Sun=6 — what column the 1st of the month falls in. */
export function monthFirstDayOffset(year: number, month: number): number {
  const d = new Date(year, month - 1, 1).getDay(); // Sun=0 ... Sat=6
  return (d + 6) % 7; // shift so Mon=0
}

function weekNumberOf(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
