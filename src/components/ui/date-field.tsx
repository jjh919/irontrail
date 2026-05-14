"use client";

import { useEffect, useState } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isAfter,
  subDays,
  startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateFieldProps {
  name: string;
  defaultDate: string; // ISO "yyyy-MM-dd"
  disableFuture?: boolean;
}

export function DateField({
  name,
  defaultDate,
  disableFuture = true,
}: DateFieldProps) {
  const [selected, setSelected] = useState(defaultDate);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parseISO(defaultDate));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const selectedDate = parseISO(selected);

  function chooseDate(d: Date) {
    setSelected(format(d, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => {
          setViewMonth(parseISO(selected));
          setOpen(true);
        }}
        className="forge-card rounded-2xl p-4 w-full flex items-center justify-between text-left active:bg-zinc-900/50 transition"
      >
        <div>
          <div className="text-zinc-500 text-[10px] uppercase mb-1">날짜</div>
          <div className="text-white font-mono text-base">
            {formatDisplay(selectedDate)}
          </div>
        </div>
        <CalendarIcon className="w-5 h-5 text-zinc-500" />
      </button>

      {open && (
        <CalendarModal
          selected={selectedDate}
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          onSelect={chooseDate}
          onClose={() => setOpen(false)}
          disableFuture={disableFuture}
        />
      )}
    </>
  );
}

function formatDisplay(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86400000,
  );

  let prefix = "";
  if (diffDays === 0) prefix = "오늘 · ";
  else if (diffDays === -1) prefix = "어제 · ";
  else if (diffDays === -2) prefix = "그제 · ";

  return prefix + format(date, "M월 d일 EEEE", { locale: ko });
}

interface ModalProps {
  selected: Date;
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  onSelect: (d: Date) => void;
  onClose: () => void;
  disableFuture: boolean;
}

function CalendarModal({
  selected,
  viewMonth,
  setViewMonth,
  onSelect,
  onClose,
  disableFuture,
}: ModalProps) {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = (monthStart.getDay() + 6) % 7; // Mon=0

  const today = startOfDay(new Date());

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="forge-card rounded-3xl w-full max-w-sm p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            aria-label="이전 달"
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-white text-base font-bold font-serif">
            {format(viewMonth, "yyyy년 M월", { locale: ko })}
          </div>
          <button
            type="button"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            aria-label="다음 달"
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
            <div
              key={d}
              className={cn(
                "text-center text-[10px] font-mono uppercase py-1",
                i === 5
                  ? "text-sky-400/60"
                  : i === 6
                    ? "text-rose-400/60"
                    : "text-zinc-600",
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((d) => {
            const isSel = isSameDay(d, selected);
            const isTd = isToday(d);
            const isFut = disableFuture && isAfter(startOfDay(d), today);
            const dow = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun

            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={isFut}
                onClick={() => onSelect(d)}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-sm font-mono transition",
                  isSel
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                    : isTd
                      ? "border border-amber-500/70 text-amber-400 font-bold"
                      : isFut
                        ? "text-zinc-700 cursor-not-allowed"
                        : cn(
                            "active:bg-zinc-800",
                            dow === 5
                              ? "text-sky-400/80"
                              : dow === 6
                                ? "text-rose-400/80"
                                : "text-zinc-200",
                          ),
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Quick chips */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => onSelect(new Date())}
            className="flex-1 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 py-2.5 rounded-xl active:bg-zinc-800"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onSelect(subDays(new Date(), 1))}
            className="flex-1 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 py-2.5 rounded-xl active:bg-zinc-800"
          >
            어제
          </button>
          <button
            type="button"
            onClick={() => onSelect(subDays(new Date(), 2))}
            className="flex-1 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 py-2.5 rounded-xl active:bg-zinc-800"
          >
            그제
          </button>
        </div>
      </div>
    </div>
  );
}
