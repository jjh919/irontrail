"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { sportConfig } from "@/lib/calendar";
import { saveWorkout, type SaveWorkoutState } from "./actions";
import type { Sport } from "@/lib/supabase/database.types";

const SPORTS: Sport[] = ["swim", "bike", "run", "weight", "other"];

export function WorkoutForm({ defaultDate }: { defaultDate: string }) {
  const [sport, setSport] = useState<Sport>("bike");
  const [rpe, setRpe] = useState(5);
  const [state, formAction, isPending] = useActionState<SaveWorkoutState, FormData>(
    saveWorkout,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="sport" value={sport} />
      <input type="hidden" name="rpe" value={rpe} />

      <div className="px-6 pt-8 pb-40 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/log"
            aria-label="뒤로"
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="text-white font-semibold">운동 기록</div>
          <div className="w-9" />
        </header>

        {/* Sport */}
        <section>
          <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2.5 px-1">
            종목
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SPORTS.map((s) => {
              const c = sportConfig[s];
              const active = sport === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition",
                    active
                      ? `${c.bg} border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]`
                      : "bg-zinc-900 border border-zinc-800",
                  )}
                  aria-pressed={active}
                >
                  <span className={cn("text-2xl", !active && "opacity-50")}>
                    {c.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-[9px]",
                      active ? "text-amber-400 font-bold" : "text-zinc-500",
                    )}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* When */}
        <section>
          <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2.5 px-1">
            언제
          </div>
          <label className="forge-card rounded-2xl p-4 flex items-center gap-3 cursor-text">
            <span className="text-zinc-500 text-xs uppercase">날짜</span>
            <input
              name="workout_date"
              type="date"
              defaultValue={defaultDate}
              required
              className="flex-1 bg-transparent text-white font-mono text-base outline-none [color-scheme:dark]"
            />
          </label>
        </section>

        {/* Metrics */}
        <section>
          <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2.5 px-1">
            측정
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MetricField label="시간" suffix="h:mm">
              <input
                name="duration"
                inputMode="decimal"
                placeholder="1:25"
                className="bg-transparent text-white font-mono font-bold text-2xl w-full outline-none placeholder:text-zinc-700"
              />
            </MetricField>
            <MetricField label="거리" suffix="km">
              <input
                name="distance_km"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="42.5"
                className="bg-transparent text-white font-mono font-bold text-2xl w-full outline-none placeholder:text-zinc-700"
              />
            </MetricField>
            <MetricField label="평균 심박" suffix="bpm">
              <input
                name="avg_hr"
                type="number"
                inputMode="numeric"
                min="1"
                max="249"
                placeholder="142"
                className="bg-transparent text-white font-mono font-bold text-2xl w-full outline-none placeholder:text-zinc-700"
              />
            </MetricField>
            <RpeField value={rpe} onChange={setRpe} />
          </div>
        </section>

        {/* Notes */}
        <section>
          <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2.5 px-1">
            메모
          </div>
          <div className="forge-card rounded-2xl p-4">
            <textarea
              name="notes"
              rows={3}
              placeholder="Z2 유지하면서 LSD 라이딩. 후반 다리 좀 무거워짐."
              className="w-full bg-transparent text-zinc-200 text-sm outline-none resize-none placeholder:text-zinc-700"
            />
          </div>
        </section>

        {/* Brick toggle */}
        <section>
          <label className="forge-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_brick"
              value="true"
              className="w-4 h-4 accent-amber-500"
            />
            <div className="flex-1">
              <div className="text-white text-sm">브릭 운동</div>
              <div className="text-zinc-500 text-[11px] mt-0.5">
                같은 날 이전 세션과 이어진 트레이닝
              </div>
            </div>
          </label>
        </section>

        {state?.error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-rose-300 text-xs">
            {state.error}
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none z-40">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold py-3.5 rounded-2xl shadow-2xl shadow-amber-500/30 pointer-events-auto active:scale-[0.99] transition"
          >
            {isPending ? "저장 중..." : "기록 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

function MetricField({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <label className="forge-card rounded-2xl p-4 cursor-text">
      <div className="text-zinc-500 text-[10px] uppercase mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        {children}
        <span className="text-zinc-500 text-xs whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}

function RpeField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="forge-card rounded-2xl p-4">
      <div className="text-zinc-500 text-[10px] uppercase mb-1">강도 RPE</div>
      <div className="flex items-baseline gap-1">
        <span className="text-white font-mono font-bold text-2xl">{value}</span>
        <span className="text-xs text-zinc-500">/10</span>
      </div>
      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`RPE ${n}`}
            className={cn(
              "flex-1 h-1.5 rounded transition",
              n <= value ? "bg-amber-500" : "bg-zinc-800",
            )}
          />
        ))}
      </div>
    </div>
  );
}
