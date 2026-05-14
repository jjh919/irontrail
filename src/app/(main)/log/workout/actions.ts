"use server";

import { redirect } from "next/navigation";
import { createWorkout } from "@/lib/db/workouts";
import {
  getPlannedForDate,
  markPlannedComplete,
} from "@/lib/db/training-plans";
import type { Sport } from "@/lib/supabase/database.types";

const VALID_SPORTS: readonly Sport[] = ["swim", "bike", "run", "weight", "other"];

export type SaveWorkoutState = { error?: string } | undefined;

export async function saveWorkout(
  _prev: SaveWorkoutState,
  formData: FormData,
): Promise<SaveWorkoutState> {
  const sportRaw = String(formData.get("sport") ?? "");
  const workout_date = String(formData.get("workout_date") ?? "").trim();
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const distance_km = numOrNull(formData.get("distance_km"));
  const avg_hr = intOrNull(formData.get("avg_hr"));
  const rpe = intOrNull(formData.get("rpe"));
  const notes = textOrNull(formData.get("notes"));
  const is_brick = formData.get("is_brick") === "true";

  if (!VALID_SPORTS.includes(sportRaw as Sport)) {
    return { error: "종목을 선택하세요." };
  }
  const sport = sportRaw as Sport;

  if (!workout_date) {
    return { error: "날짜를 입력하세요." };
  }

  const duration = parseDuration(durationRaw);

  let createdId: string;
  try {
    const created = await createWorkout({
      sport,
      workout_date,
      duration,
      distance_km,
      avg_hr,
      rpe,
      notes,
      is_brick,
      source: "manual",
    });
    createdId = created.id;
  } catch (e) {
    console.error("[saveWorkout] createWorkout failed:", e);
    return { error: friendlyError(e) };
  }

  // Best-effort: auto-link to today's matching planned workout.
  try {
    const planned = await getPlannedForDate(workout_date);
    if (
      planned &&
      planned.sport === sport &&
      !planned.completed_workout_id
    ) {
      await markPlannedComplete(planned.id, createdId);
    }
  } catch {
    // Non-critical — workout was saved either way.
  }

  redirect("/calendar");
}

/** "1:25" | "1:25:30" | "85" → "HH:MM:SS" interval string, or null. */
function parseDuration(raw: string): string | null {
  if (!raw) return null;
  const colon = /^(\d+):(\d+)(?::(\d+))?$/.exec(raw);
  if (colon) {
    const h = parseInt(colon[1], 10);
    const m = parseInt(colon[2], 10);
    const s = colon[3] ? parseInt(colon[3], 10) : 0;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  const n = parseFloat(raw);
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
    // Supabase PostgrestError shape: { message, details, hint, code }
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
  if (/violates check constraint.*hr/i.test(msg))
    return "심박수는 1–249 사이여야 합니다.";
  if (/violates check constraint.*rpe/i.test(msg))
    return "RPE는 1–10 사이여야 합니다.";
  if (/violates check constraint.*distance/i.test(msg))
    return "거리는 0 이상이어야 합니다.";
  return msg || "저장에 실패했습니다.";
}
