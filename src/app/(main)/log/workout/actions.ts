"use server";

import { redirect } from "next/navigation";
import { createWorkout, type WorkoutInput } from "@/lib/db/workouts";
import {
  getPlannedForDate,
  markPlannedComplete,
} from "@/lib/db/training-plans";
import { parsePaceMmSs } from "@/lib/date";
import type { Sport } from "@/lib/supabase/database.types";

const VALID_SPORTS: readonly Sport[] = ["swim", "bike", "run", "weight", "other"];

export type SaveWorkoutState = { error?: string } | undefined;

export async function saveWorkout(
  _prev: SaveWorkoutState,
  formData: FormData,
): Promise<SaveWorkoutState> {
  const sportRaw = String(formData.get("sport") ?? "");
  if (!VALID_SPORTS.includes(sportRaw as Sport)) {
    return { error: "종목을 선택하세요." };
  }
  const sport = sportRaw as Sport;

  const workout_date = String(formData.get("workout_date") ?? "").trim();
  if (!workout_date) {
    return { error: "날짜를 입력하세요." };
  }

  // --- Common metrics ---
  const duration = parseDuration(String(formData.get("duration") ?? ""));
  // Swim: input is meters → store as km. Other sports: input is km already.
  const distRaw = numOrNull(formData.get("distance"));
  const distance_km =
    sport === "swim" && distRaw != null ? distRaw / 1000 : distRaw;
  const avg_hr = intOrNull(formData.get("avg_hr"));
  const max_hr = intOrNull(formData.get("max_hr"));
  const rpe = intOrNull(formData.get("rpe"));
  const notes = textOrNull(formData.get("notes"));
  const is_brick = formData.get("is_brick") === "true";

  // --- Sport-specific metrics ---
  const sportFields = pickSportFields(sport, formData);

  let createdId: string;
  try {
    const created = await createWorkout({
      sport,
      workout_date,
      duration,
      distance_km,
      avg_hr,
      max_hr,
      rpe,
      notes,
      is_brick,
      source: "manual",
      ...sportFields,
    });
    createdId = created.id;
  } catch (e) {
    console.error("[saveWorkout] createWorkout failed:", e);
    return { error: friendlyError(e) };
  }

  // Auto-link to today's matching planned workout
  try {
    const planned = await getPlannedForDate(workout_date);
    if (planned && planned.sport === sport && !planned.completed_workout_id) {
      await markPlannedComplete(planned.id, createdId);
    }
  } catch {
    // non-critical
  }

  redirect("/calendar");
}

function pickSportFields(sport: Sport, fd: FormData): Partial<WorkoutInput> {
  if (sport === "swim") {
    return {
      avg_pace_s: parsePaceMmSs(String(fd.get("avg_pace_s") ?? "")),
      pool_length_m: intOrNull(fd.get("pool_length_m")),
      stroke_style: textOrNull(fd.get("stroke_style")),
    };
  }
  if (sport === "bike") {
    return {
      avg_speed_kmh: numOrNull(fd.get("avg_speed_kmh")),
      elevation_gain_m: intOrNull(fd.get("elevation_gain_m")),
      avg_cadence: intOrNull(fd.get("avg_cadence")),
      avg_power_w: intOrNull(fd.get("avg_power_w")),
    };
  }
  if (sport === "run") {
    return {
      avg_pace_s: parsePaceMmSs(String(fd.get("avg_pace_s") ?? "")),
      elevation_gain_m: intOrNull(fd.get("elevation_gain_m")),
      avg_cadence: intOrNull(fd.get("avg_cadence")),
    };
  }
  return {};
}

/** "1:25" | "1:25:30" | "85" → "HH:MM:SS" interval string, or null. */
function parseDuration(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const colon = /^(\d+):(\d+)(?::(\d+))?$/.exec(t);
  if (colon) {
    const h = parseInt(colon[1], 10);
    const m = parseInt(colon[2], 10);
    const s = colon[3] ? parseInt(colon[3], 10) : 0;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  const n = parseFloat(t);
  if (Number.isFinite(n) && n > 0) {
    const totalMin = Math.round(n);
    return `${pad(Math.floor(totalMin / 60))}:${pad(totalMin % 60)}:00`;
  }
  return null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function textOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

function friendlyError(e: unknown): string {
  let msg = "";
  if (e instanceof Error) {
    msg = e.message;
  } else if (typeof e === "object" && e !== null) {
    const obj = e as Record<string, unknown>;
    msg = String(
      obj.message ?? obj.details ?? obj.hint ?? obj.code ?? JSON.stringify(e),
    );
  } else {
    msg = String(e);
  }

  if (/null value in column "user_id"/i.test(msg)) {
    return "user_id 기본값이 설정 안 됐어요. 마이그레이션 003 적용했는지 Supabase 대시보드에서 확인하세요.";
  }
  if (/row-level security|new row violates row-level security/i.test(msg)) {
    return "RLS 정책에 막혔어요. 로그인 상태가 만료됐을 수 있습니다 — 로그아웃 후 다시 로그인해 주세요.";
  }
  if (/column .* does not exist/i.test(msg)) {
    return "스키마가 최신이 아닙니다. 마이그레이션 004(종목별 컬럼)를 적용해 주세요.";
  }
  if (/violates check constraint.*hr/i.test(msg))
    return "심박수는 1–249 사이여야 합니다.";
  if (/violates check constraint.*rpe/i.test(msg))
    return "RPE는 1–10 사이여야 합니다.";
  if (/violates check constraint.*distance/i.test(msg))
    return "거리는 0 이상이어야 합니다.";
  if (/violates check constraint.*pace/i.test(msg))
    return "페이스는 0보다 커야 합니다.";
  if (/violates check constraint.*cadence/i.test(msg))
    return "케이던스는 0보다 커야 합니다.";
  return msg || "저장에 실패했습니다.";
}
