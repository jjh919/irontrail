"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  currentWeek,
  weekSummary,
  monthMeta,
  monthDays,
  monthSummary,
  weeklyVolumes,
  sportConfig,
  type Sport,
  type DayEntry,
  type MonthDay,
} from "@/lib/mock/calendar";

type ViewMode = "week" | "month";

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week");

  return (
    <div className="px-6 pt-8 pb-6 space-y-4">
      <Header view={view} />
      <ViewToggle view={view} onChange={setView} />
      {view === "week" ? <WeekView /> : <MonthView />}
    </div>
  );
}

function Header({ view }: { view: ViewMode }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="text-zinc-500 text-xs">
          {view === "week" ? "이번 주" : "이번 달"}
        </div>
        <div className="text-white text-lg font-semibold mt-0.5">
          {view === "week" ? "5월 11일 - 17일" : monthMeta.label}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="이전"
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 active:bg-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="다음"
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 active:bg-zinc-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-full p-1 flex">
      <button
        type="button"
        onClick={() => onChange("week")}
        className={cn(
          "flex-1 text-xs py-2 rounded-full transition-colors",
          view === "week"
            ? "bg-amber-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            : "text-zinc-500",
        )}
      >
        주간
      </button>
      <button
        type="button"
        onClick={() => onChange("month")}
        className={cn(
          "flex-1 text-xs py-2 rounded-full transition-colors",
          view === "month"
            ? "bg-amber-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            : "text-zinc-500",
        )}
      >
        월간
      </button>
    </div>
  );
}

/* ---------- WEEKLY VIEW ---------- */

function WeekView() {
  return (
    <>
      {/* Summary card */}
      <section className="forge-card rounded-3xl p-5">
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-zinc-500 text-[10px] uppercase tracking-widest">
            Week Total
          </div>
          <div className="text-zinc-500 text-[10px] font-mono">
            W{weekSummary.weekNumber} · {weekSummary.completed}/{weekSummary.planned} 완료
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="시간" value={weekSummary.totalTime} />
          <Stat
            label="거리"
            value={weekSummary.totalDistance.split(" ")[0]}
            unit={weekSummary.totalDistance.split(" ")[1]}
          />
          <Stat label="TSS" value={String(weekSummary.totalTss)} />
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {weekSummary.breakdown.map((b) => (
              <div
                key={b.sport}
                className={sportConfig[b.sport].bar}
                style={{ width: `${b.percent}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px]">
            {weekSummary.breakdown.map((b) => (
              <div key={b.sport} className="flex items-center gap-1">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    sportConfig[b.sport].dot,
                  )}
                />
                <span className="text-zinc-400">{sportConfig[b.sport].label}</span>
                <span className="text-zinc-600 font-mono">{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Day cards */}
      <section className="space-y-3">
        {currentWeek.map((day) => (
          <DayRow key={day.date} day={day} />
        ))}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div>
      <div className="text-zinc-500 text-[10px] uppercase">{label}</div>
      <div className="text-white font-mono font-bold text-xl mt-1">
        {value}
        {unit && <span className="text-xs text-zinc-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function DayRow({ day }: { day: DayEntry }) {
  const isToday = day.status === "today";
  const isRest = day.status === "rest";
  const isDone = day.status === "done";

  const statusLabel: Record<DayEntry["status"], string> = {
    done: "완료",
    today: "오늘",
    planned: "계획",
    rest: "휴식",
    missed: "누락",
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5 px-1">
        <div
          className={cn(
            "text-xs font-bold",
            isToday ? "text-amber-400" : "text-zinc-300",
          )}
        >
          {day.dayName}
        </div>
        <div
          className={cn(
            "text-xs font-mono",
            isToday ? "text-amber-400" : "text-zinc-500",
          )}
        >
          {day.date.slice(5).replace("-", "/")}
        </div>
        <div
          className={cn(
            "ml-auto text-[10px] uppercase tracking-widest",
            isToday
              ? "text-amber-400 font-bold"
              : isDone
                ? "text-amber-500/70"
                : day.session?.isBrick
                  ? "text-amber-500/70 font-bold"
                  : "text-zinc-500",
          )}
        >
          {day.session?.isBrick ? "★ Brick" : statusLabel[day.status]}
        </div>
      </div>

      {isRest ? <RestCard /> : <SessionCard day={day} />}
    </div>
  );
}

function RestCard() {
  return (
    <div className="rounded-2xl p-3.5 border border-zinc-800 border-dashed bg-zinc-950/40 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600">
        <Minus className="w-4 h-4" />
      </div>
      <div className="text-zinc-500 text-sm">회복일 · 가벼운 스트레칭</div>
    </div>
  );
}

function SessionCard({ day }: { day: DayEntry }) {
  if (!day.session) return null;
  const s = day.session;
  const isToday = day.status === "today";

  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 flex items-center gap-3",
        isToday
          ? "bg-amber-500/[0.06] border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
          : "forge-card",
      )}
    >
      {/* Sport icon(s) */}
      {s.sports.length === 1 ? (
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-lg border",
            sportConfig[s.sports[0]].bg,
            sportConfig[s.sports[0]].border,
          )}
        >
          {sportConfig[s.sports[0]].emoji}
        </div>
      ) : (
        <div className="flex -space-x-2">
          {s.sports.map((sp, i) => (
            <div
              key={sp}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-lg border",
                sportConfig[sp].bg,
                sportConfig[sp].border,
                i === 0 && "z-10",
              )}
            >
              {sportConfig[sp].emoji}
            </div>
          ))}
        </div>
      )}

      <div className={cn("flex-1 min-w-0", s.sports.length > 1 && "ml-1")}>
        <div className="text-white text-sm font-semibold">{s.title}</div>
        <div className="text-zinc-500 text-[11px] mt-0.5 font-mono">
          {[s.duration, s.distance, s.pace ? `페이스 ${s.pace}` : null]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>

      {isToday ? (
        <button
          type="button"
          className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-zinc-950 px-2.5 py-1.5 rounded-md"
        >
          시작
        </button>
      ) : day.status === "done" ? (
        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-zinc-700" />
      )}
    </div>
  );
}

/* ---------- MONTHLY VIEW ---------- */

function MonthView() {
  return (
    <>
      {/* Summary */}
      <section className="forge-card rounded-2xl p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-zinc-500 text-[10px] uppercase tracking-widest">
            Month Total
          </div>
          <div className="text-zinc-500 text-[10px] font-mono">
            {monthSummary.completed}/{monthSummary.planned} 완료 ·{" "}
            {Math.round((monthSummary.completed / monthSummary.planned) * 100)}%
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <MiniStat label="시간" value={monthSummary.totalTime} />
          <MiniStat label="거리" value={monthSummary.totalDistance} />
          <MiniStat label="TSS" value={String(monthSummary.totalTss)} />
          <MiniStat
            label="vs 4월"
            value={monthSummary.vsLastMonth}
            highlight
          />
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
          {monthSummary.breakdown.map((b) => (
            <div
              key={b.sport}
              className={sportConfig[b.sport].bar}
              style={{ width: `${b.percent}%` }}
            />
          ))}
        </div>
      </section>

      {/* Calendar grid */}
      <section>
        <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-mono text-zinc-600 uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: monthMeta.firstDayOffset }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {monthDays.map((d) => (
            <DayCell key={d.day} day={d} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-zinc-500">
          {(["swim", "bike", "run", "weight"] as Sport[]).map((sp) => (
            <div key={sp} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  sportConfig[sp].dot,
                )}
              />
              <span>{sportConfig[sp].label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded ring-1 ring-amber-500" />
            <span>브릭</span>
          </div>
          <div className="flex items-center gap-1.5">
            <X className="w-2 h-2 text-rose-900" strokeWidth={3} />
            <span>누락</span>
          </div>
        </div>
      </section>

      {/* Weekly volume bars */}
      <section>
        <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-2 px-1">
          주차별 볼륨
        </div>
        <div className="forge-card rounded-2xl p-4 space-y-3">
          {weeklyVolumes.map((w) => (
            <WeekVolumeRow key={w.weekNum} {...w} />
          ))}
          <div className="pt-1 text-[10px] text-zinc-500">
            W22 회복주 · 자동 삽입됨
          </div>
        </div>
      </section>
    </>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-zinc-500 text-[9px] uppercase">{label}</div>
      <div
        className={cn(
          "font-mono font-bold text-base mt-0.5",
          highlight ? "text-amber-400" : "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DayCell({ day }: { day: MonthDay }) {
  const isToday = day.status === "today";
  const isMissed = day.status === "missed";
  const isRest = day.status === "rest";
  const isBrick = day.status === "brick";
  const isPlanned = day.status === "planned";

  const cellBg = isToday
    ? "bg-amber-500/10 ring-2 ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
    : isBrick
      ? "bg-amber-500/[0.08] border border-amber-500/30"
      : isPlanned
        ? "bg-zinc-900/50 border border-zinc-800 border-dashed"
        : isRest
          ? "bg-zinc-950 border border-zinc-900"
          : "bg-zinc-900 border border-zinc-800";

  const dayNumColor = isToday
    ? "text-amber-400 font-bold"
    : isBrick
      ? "text-amber-500/70"
      : isRest
        ? "text-zinc-700"
        : "text-zinc-600";

  return (
    <div
      className={cn(
        "aspect-square rounded-lg p-1 flex flex-col",
        cellBg,
      )}
    >
      <div className={cn("text-[9px] font-mono", dayNumColor)}>{day.day}</div>
      <div className="flex-1 flex items-center justify-center gap-0.5">
        {isMissed ? (
          <X className="w-2.5 h-2.5 text-rose-900" strokeWidth={2.5} />
        ) : (
          day.sports?.map((sp) => (
            <div
              key={sp}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isToday && "animate-pulse",
                isPlanned
                  ? cn(sportConfig[sp].bar, "opacity-40")
                  : sportConfig[sp].bar,
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WeekVolumeRow({
  weekNum,
  time,
  percent,
  isCurrent,
  isFuture,
  isRecovery,
}: {
  weekNum: number;
  time: string;
  percent: number;
  isPast?: boolean;
  isCurrent?: boolean;
  isFuture?: boolean;
  isRecovery?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-zinc-500 text-[10px] font-mono w-8">W{weekNum}</div>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            isCurrent
              ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              : isFuture
                ? "bg-zinc-700"
                : "bg-amber-500/50",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        className={cn(
          "text-[11px] font-mono w-12 text-right",
          isCurrent
            ? "text-amber-400 font-bold"
            : isRecovery
              ? "text-zinc-600"
              : isFuture
                ? "text-zinc-600"
                : "text-zinc-400",
        )}
      >
        {time}
      </div>
    </div>
  );
}
