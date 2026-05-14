import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

/** ISO calendar date "YYYY-MM-DD" in local time. */
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Monday–Sunday week range as ISO dates. */
export function weekRange(date: Date = new Date()): { start: string; end: string } {
  return {
    start: toISODate(startOfWeek(date, { weekStartsOn: 1 })),
    end: toISODate(endOfWeek(date, { weekStartsOn: 1 })),
  };
}

export function monthRange(date: Date = new Date()): { start: string; end: string } {
  return {
    start: toISODate(startOfMonth(date)),
    end: toISODate(endOfMonth(date)),
  };
}

/** Parse a Postgres interval string into seconds. Handles "HH:MM:SS" + "N day HH:MM:SS". */
export function intervalToSeconds(interval: string | null): number {
  if (!interval) return 0;
  const days = /(\d+)\s+days?/.exec(interval)?.[1];
  const time = /(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(interval);
  const dayPart = days ? parseInt(days, 10) * 86400 : 0;
  if (!time) return dayPart;
  return (
    dayPart +
    parseInt(time[1], 10) * 3600 +
    parseInt(time[2], 10) * 60 +
    parseFloat(time[3])
  );
}

/** Format seconds as Postgres-compatible "HH:MM:SS" interval. */
export function secondsToPgInterval(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Friendly Korean duration display: "1h 25m", "45m", "20s". */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${Math.round(seconds)}s`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Parse a pace string in "mm:ss" or "ss" form into total seconds.
 * "1:42" → 102. "4:30" → 270. "270" → 270.
 */
export function parsePaceMmSs(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const colon = /^(\d+):(\d{1,2})$/.exec(trimmed);
  if (colon) {
    const min = parseInt(colon[1], 10);
    const sec = parseInt(colon[2], 10);
    if (sec >= 60) return null;
    const total = min * 60 + sec;
    return total > 0 ? total : null;
  }
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Format pace seconds back to "m:ss". */
export function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${pad(sec)}`;
}
