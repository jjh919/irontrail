export type Sport = "swim" | "bike" | "run" | "weight";
export type SessionStatus = "done" | "today" | "planned" | "rest" | "missed";

export interface Session {
  sports: Sport[];
  title: string;
  duration?: string;
  distance?: string;
  pace?: string;
  intensity?: number;
  isBrick?: boolean;
}

export interface DayEntry {
  date: string;
  dayName: string;
  status: SessionStatus;
  session?: Session;
}

export interface WeekSummaryData {
  weekNumber: number;
  totalTime: string;
  totalDistance: string;
  totalTss: number;
  completed: number;
  planned: number;
  breakdown: Array<{ sport: Sport; time: string; percent: number }>;
}

export interface MonthDay {
  day: number;
  status: "done" | "today" | "planned" | "rest" | "missed" | "brick";
  sports?: Sport[];
}

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
};

export const currentWeek: DayEntry[] = [
  {
    date: "2026-05-11",
    dayName: "월",
    status: "done",
    session: {
      sports: ["swim"],
      title: "드릴 + 스윔",
      duration: "40'",
      distance: "1.8km",
      pace: "1:48",
    },
  },
  {
    date: "2026-05-12",
    dayName: "화",
    status: "done",
    session: {
      sports: ["swim"],
      title: "인터벌 수영",
      duration: "45'",
      distance: "1.5km",
      pace: "1:45",
    },
  },
  { date: "2026-05-13", dayName: "수", status: "rest" },
  {
    date: "2026-05-14",
    dayName: "목",
    status: "today",
    session: {
      sports: ["bike"],
      title: "LSD 라이딩",
      duration: "1h 30'",
      distance: "45km",
      intensity: 2,
    },
  },
  {
    date: "2026-05-15",
    dayName: "금",
    status: "planned",
    session: {
      sports: ["run"],
      title: "템포 러닝",
      duration: "45'",
      distance: "8km",
      pace: "4:30",
    },
  },
  {
    date: "2026-05-16",
    dayName: "토",
    status: "planned",
    session: {
      sports: ["bike", "run"],
      title: "사이클 → 러닝 브릭",
      duration: "2h 30'",
      distance: "60km + 8km",
      isBrick: true,
    },
  },
  { date: "2026-05-17", dayName: "일", status: "rest" },
];

export const weekSummary: WeekSummaryData = {
  weekNumber: 20,
  totalTime: "6h 20m",
  totalDistance: "65 km",
  totalTss: 380,
  completed: 4,
  planned: 6,
  breakdown: [
    { sport: "swim", time: "1:25", percent: 22 },
    { sport: "bike", time: "3:00", percent: 47 },
    { sport: "run", time: "1:15", percent: 20 },
    { sport: "weight", time: "0:40", percent: 11 },
  ],
};

export const monthMeta = {
  year: 2026,
  month: 5,
  label: "2026년 5월",
  firstDayOffset: 4,
};

export const monthDays: MonthDay[] = [
  { day: 1, status: "done", sports: ["run"] },
  { day: 2, status: "done", sports: ["bike", "run"] },
  { day: 3, status: "rest" },
  { day: 4, status: "done", sports: ["swim"] },
  { day: 5, status: "done", sports: ["bike"] },
  { day: 6, status: "missed" },
  { day: 7, status: "done", sports: ["run"] },
  { day: 8, status: "done", sports: ["weight"] },
  { day: 9, status: "brick", sports: ["bike", "run"] },
  { day: 10, status: "rest" },
  { day: 11, status: "done", sports: ["swim"] },
  { day: 12, status: "done", sports: ["swim"] },
  { day: 13, status: "rest" },
  { day: 14, status: "today", sports: ["bike"] },
  { day: 15, status: "planned", sports: ["run"] },
  { day: 16, status: "planned", sports: ["bike", "run"] },
  { day: 17, status: "rest" },
  { day: 18, status: "planned", sports: ["swim"] },
  { day: 19, status: "planned", sports: ["bike"] },
  { day: 20, status: "rest" },
  { day: 21, status: "planned", sports: ["run"] },
  { day: 22, status: "planned", sports: ["weight"] },
  { day: 23, status: "planned", sports: ["bike", "run"] },
  { day: 24, status: "rest" },
  { day: 25, status: "planned", sports: ["swim"] },
  { day: 26, status: "planned", sports: ["swim"] },
  { day: 27, status: "planned", sports: ["run"] },
  { day: 28, status: "planned", sports: ["bike"] },
  { day: 29, status: "planned", sports: ["run"] },
  { day: 30, status: "planned", sports: ["bike", "run"] },
  { day: 31, status: "rest" },
];

export const monthSummary = {
  totalTime: "24h",
  totalDistance: "260km",
  totalTss: 1420,
  vsLastMonth: "+12%",
  completed: 18,
  planned: 24,
  breakdown: [
    { sport: "swim" as Sport, percent: 22 },
    { sport: "bike" as Sport, percent: 48 },
    { sport: "run" as Sport, percent: 22 },
    { sport: "weight" as Sport, percent: 8 },
  ],
};

export interface WeeklyVolume {
  weekNum: number;
  time: string;
  percent: number;
  isPast?: boolean;
  isCurrent?: boolean;
  isFuture?: boolean;
  isRecovery?: boolean;
}

export const weeklyVolumes: WeeklyVolume[] = [
  { weekNum: 18, time: "5h 40m", percent: 70, isPast: true },
  { weekNum: 19, time: "5h 50m", percent: 73, isPast: true },
  { weekNum: 20, time: "6h 20m", percent: 79, isCurrent: true },
  { weekNum: 21, time: "7h 00m", percent: 85, isFuture: true },
  { weekNum: 22, time: "4h 00m", percent: 50, isFuture: true, isRecovery: true },
];
