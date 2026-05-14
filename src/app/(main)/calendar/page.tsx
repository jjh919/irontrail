import { weekRange, monthRange, todayISO } from "@/lib/date";
import { listWorkouts } from "@/lib/db/workouts";
import { listPlannedByDateRange } from "@/lib/db/training-plans";
import {
  buildWeekEntries,
  buildWeekSummary,
  buildMonthDays,
  monthFirstDayOffset,
} from "@/lib/calendar";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const today = todayISO();
  const now = new Date();
  const wr = weekRange(now);
  const mr = monthRange(now);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [weekWorkouts, weekPlanned, monthWorkouts, monthPlanned] =
    await Promise.all([
      listWorkouts({ from: wr.start, to: wr.end }),
      listPlannedByDateRange(wr.start, wr.end),
      listWorkouts({ from: mr.start, to: mr.end }),
      listPlannedByDateRange(mr.start, mr.end),
    ]);

  const weekEntries = buildWeekEntries(weekWorkouts, weekPlanned, wr.start, today);
  const weekSummary = buildWeekSummary(weekWorkouts, weekPlanned, wr.start);
  const monthDays = buildMonthDays(monthWorkouts, monthPlanned, year, month, today);
  const firstDayOffset = monthFirstDayOffset(year, month);

  return (
    <CalendarView
      weekRangeLabel={formatWeekRange(wr.start, wr.end)}
      monthLabel={`${year}년 ${month}월`}
      weekEntries={weekEntries}
      weekSummary={weekSummary}
      monthDays={monthDays}
      monthFirstDayOffset={firstDayOffset}
      monthWorkoutsCount={monthWorkouts.length}
      monthPlannedCount={monthPlanned.length}
    />
  );
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return `${s.getMonth() + 1}월 ${s.getDate()}일 - ${e.getDate()}일`;
}
