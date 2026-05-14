"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { sportConfig } from "@/lib/calendar";
import { saveWorkout, type SaveWorkoutState } from "./actions";
import type { Sport } from "@/lib/supabase/database.types";

const SPORTS: Sport[] = ["swim", "bike", "run", "weight", "other"];

const STROKE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "freestyle", label: "자유형" },
  { value: "backstroke", label: "배영" },
  { value: "breaststroke", label: "평영" },
  { value: "butterfly", label: "접영" },
  { value: "medley", label: "혼영" },
  { value: "mixed", label: "혼합" },
];

const POOL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "25", label: "25m" },
  { value: "50", label: "50m" },
  { value: "open", label: "오픈워터" },
];

export function WorkoutForm({ defaultDate }: { defaultDate: string }) {
  const [sport, setSport] = useState<Sport>("bike");
  const [rpe, setRpe] = useState(5);
  const [poolLength, setPoolLength] = useState("");
  const [stroke, setStroke] = useState("");
  const [state, formAction, isPending] = useActionState<SaveWorkoutState, FormData>(
    saveWorkout,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="sport" value={sport} />
      <input type="hidden" name="rpe" value={rpe} />
      <input type="hidden" name="pool_length_m" value={poolLength} />
      <input type="hidden" name="stroke_style" value={stroke} />

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
          <SectionLabel>종목</SectionLabel>
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

        {/* Date */}
        <section>
          <SectionLabel>언제</SectionLabel>
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

        {/* Common metrics */}
        <section>
          <SectionLabel>기본 측정</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <MetricField label="시간" suffix="h:mm">
              <TextInput name="duration" placeholder="1:25" inputMode="decimal" />
            </MetricField>
            {sport !== "weight" && sport !== "other" ? (
              <MetricField
                label="거리"
                suffix={sport === "swim" ? "m" : "km"}
              >
                <NumInput
                  name="distance"
                  placeholder={sport === "swim" ? "1500" : "42.5"}
                  step={sport === "swim" ? "10" : "0.01"}
                />
              </MetricField>
            ) : (
              <MetricField label="거리 (선택)" suffix="km">
                <NumInput name="distance" placeholder="—" step="0.01" />
              </MetricField>
            )}
            <MetricField label="평균 심박" suffix="bpm">
              <NumInput name="avg_hr" placeholder="142" min="1" max="249" />
            </MetricField>
            <MetricField label="최대 심박" suffix="bpm">
              <NumInput name="max_hr" placeholder="172" min="1" max="249" />
            </MetricField>
          </div>
        </section>

        {/* Sport-specific metrics */}
        {sport === "swim" && (
          <section className="space-y-2">
            <SectionLabel>수영 디테일</SectionLabel>

            <MetricField label="페이스" suffix="/100m">
              <TextInput
                name="avg_pace_s"
                placeholder="1:42"
                inputMode="decimal"
              />
            </MetricField>

            <ChipsCard label="풀 길이" cols={3}>
              {POOL_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={poolLength === o.value}
                  onClick={() =>
                    setPoolLength(poolLength === o.value ? "" : o.value)
                  }
                >
                  {o.label}
                </Chip>
              ))}
            </ChipsCard>

            <ChipsCard label="영법" wrap>
              {STROKE_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={stroke === o.value}
                  onClick={() =>
                    setStroke(stroke === o.value ? "" : o.value)
                  }
                >
                  {o.label}
                </Chip>
              ))}
            </ChipsCard>
          </section>
        )}

        {sport === "bike" && (
          <section>
            <SectionLabel>사이클 디테일</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <MetricField label="평균 속도" suffix="km/h">
                <NumInput name="avg_speed_kmh" placeholder="32.5" step="0.1" />
              </MetricField>
              <MetricField label="누적 고도" suffix="m">
                <NumInput name="elevation_gain_m" placeholder="540" />
              </MetricField>
              <MetricField label="케이던스" suffix="rpm">
                <NumInput name="avg_cadence" placeholder="88" />
              </MetricField>
              <MetricField label="평균 파워" suffix="W">
                <NumInput name="avg_power_w" placeholder="220" />
              </MetricField>
            </div>
          </section>
        )}

        {sport === "run" && (
          <section>
            <SectionLabel>러닝 디테일</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <MetricField label="페이스" suffix="/km">
                <TextInput
                  name="avg_pace_s"
                  placeholder="4:30"
                  inputMode="decimal"
                />
              </MetricField>
              <MetricField label="케이던스" suffix="spm">
                <NumInput name="avg_cadence" placeholder="172" />
              </MetricField>
              <MetricField label="누적 고도" suffix="m">
                <NumInput name="elevation_gain_m" placeholder="120" />
              </MetricField>
            </div>
          </section>
        )}

        {/* RPE */}
        <section>
          <SectionLabel>강도</SectionLabel>
          <RpeField value={rpe} onChange={setRpe} />
        </section>

        {/* Notes */}
        <section>
          <SectionLabel>메모</SectionLabel>
          <div className="forge-card rounded-2xl p-4">
            <textarea
              name="notes"
              rows={3}
              placeholder={notesPlaceholder(sport)}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2.5 px-1">
      {children}
    </div>
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
    <div className="forge-card rounded-2xl p-4">
      <div className="text-zinc-500 text-[10px] uppercase mb-1.5">{label}</div>
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">{children}</div>
        <span className="text-zinc-500 text-xs whitespace-nowrap pb-1">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function TextInput({
  name,
  placeholder,
  inputMode,
}: {
  name: string;
  placeholder: string;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  return (
    <input
      name={name}
      type="text"
      inputMode={inputMode ?? "text"}
      placeholder={placeholder}
      className="bg-transparent text-white font-mono font-bold text-2xl leading-7 w-full outline-none border-0 p-0 placeholder:text-zinc-700"
    />
  );
}

function NumInput({
  name,
  placeholder,
  step,
  min,
  max,
}: {
  name: string;
  placeholder: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <input
      name={name}
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className="bg-transparent text-white font-mono font-bold text-2xl leading-7 w-full outline-none border-0 p-0 placeholder:text-zinc-700"
    />
  );
}

function ChipsCard({
  label,
  cols,
  wrap,
  children,
}: {
  label: string;
  cols?: number;
  wrap?: boolean;
  children: React.ReactNode;
}) {
  const grid = cols
    ? cols === 3
      ? "grid grid-cols-3 gap-2"
      : cols === 2
        ? "grid grid-cols-2 gap-2"
        : "grid grid-cols-4 gap-2"
    : wrap
      ? "flex flex-wrap gap-2"
      : "flex gap-2";
  return (
    <div className="forge-card rounded-2xl p-4">
      <div className="text-zinc-500 text-[10px] uppercase mb-3">{label}</div>
      <div className={grid}>{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-4 py-2.5 rounded-xl border text-sm transition active:scale-95",
        active
          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700",
      )}
    >
      {children}
    </button>
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
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-zinc-500 text-[10px] uppercase">RPE</div>
        <div>
          <span className="text-white font-mono font-bold text-2xl">{value}</span>
          <span className="text-xs text-zinc-500 ml-1">/10</span>
        </div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`RPE ${n}`}
            className={cn(
              "flex-1 h-2.5 rounded transition",
              n <= value ? "bg-amber-500" : "bg-zinc-800",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function notesPlaceholder(sport: Sport): string {
  switch (sport) {
    case "swim":
      return "물 컨디션, 호흡, 영법 별 페이스 차이 등";
    case "bike":
      return "Z2 유지, 후반 다리 무거움. 코스 평지/언덕.";
    case "run":
      return "포어풋 착지 의식. 호흡 안정. 컨디션.";
    case "weight":
      return "벤치 3×8 60kg, 스쿼트 4×6 80kg ...";
    default:
      return "오늘 운동 메모";
  }
}
