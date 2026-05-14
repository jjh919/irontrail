import Link from "next/link";
import { Activity, HeartPulse, UtensilsCrossed, ChevronRight } from "lucide-react";

export default function LogPage() {
  return (
    <div className="px-6 pt-8 space-y-5">
      <header>
        <div className="text-zinc-500 text-xs">기록</div>
        <h1 className="text-white text-2xl font-serif mt-1">무엇을 남길까요</h1>
      </header>

      <div className="space-y-3 pt-2">
        <LogLink
          href="/log/workout"
          emoji="🏃"
          label="운동"
          desc="수영·사이클·러닝·웨이트"
          accent="amber-500"
        />
        <LogLink
          href="/log/condition"
          emoji="❤️"
          label="컨디션"
          desc="수면·피로·체중·메모"
          accent="rose-400"
        />
        <LogLink
          href="/log/meal"
          emoji="🍱"
          label="식사"
          desc="텍스트 입력 + AI 분석 (곧)"
          accent="sky-400"
          disabled
        />
      </div>
    </div>
  );
}

function LogLink({
  href,
  emoji,
  label,
  desc,
  disabled,
}: {
  href: string;
  emoji: string;
  label: string;
  desc: string;
  accent: string;
  disabled?: boolean;
}) {
  const inner = (
    <div className="forge-card rounded-3xl p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-base">{label}</div>
        <div className="text-zinc-500 text-xs mt-0.5">{desc}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-600" />
    </div>
  );

  if (disabled) {
    return <div className="opacity-40 pointer-events-none">{inner}</div>;
  }
  return <Link href={href}>{inner}</Link>;
}
