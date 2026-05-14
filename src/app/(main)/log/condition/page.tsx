import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDailyCheck, upsertDailyCheck } from "@/lib/db/daily-checks";
import { todayISO } from "@/lib/date";

async function saveCondition(formData: FormData) {
  "use server";
  await upsertDailyCheck({
    check_date: todayISO(),
    sleep_h: numOrNull(formData.get("sleep_h")),
    fatigue: intOrNull(formData.get("fatigue")),
    weight_kg: numOrNull(formData.get("weight_kg")),
    notes: textOrNull(formData.get("notes")),
  });
  redirect("/");
}

export default async function ConditionPage() {
  const current = await getDailyCheck(todayISO());

  return (
    <div className="px-6 pt-8 pb-6 space-y-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="뒤로"
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="text-white font-semibold">오늘 컨디션</div>
        <div className="w-9" />
      </header>

      <div className="text-zinc-500 text-xs px-1">
        매일 아침 1탭으로 기록 — 부상 예방의 출발점이에요
      </div>

      <form action={saveCondition} className="space-y-3">
        <FieldCard label="수면" suffix="h">
          <input
            name="sleep_h"
            type="number"
            step="0.1"
            min="0"
            max="24"
            defaultValue={current?.sleep_h ?? ""}
            placeholder="7.5"
            className="bg-transparent text-white font-mono font-bold text-3xl w-24 outline-none placeholder:text-zinc-700"
          />
        </FieldCard>

        <FieldCard label="피로" suffix="/10">
          <input
            name="fatigue"
            type="number"
            step="1"
            min="1"
            max="10"
            defaultValue={current?.fatigue ?? ""}
            placeholder="3"
            className="bg-transparent text-white font-mono font-bold text-3xl w-20 outline-none placeholder:text-zinc-700"
          />
        </FieldCard>

        <FieldCard label="체중" suffix="kg">
          <input
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            defaultValue={current?.weight_kg ?? ""}
            placeholder="68.4"
            className="bg-transparent text-white font-mono font-bold text-3xl w-28 outline-none placeholder:text-zinc-700"
          />
        </FieldCard>

        <div className="forge-card rounded-2xl p-4">
          <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
            메모 (선택)
          </div>
          <textarea
            name="notes"
            rows={3}
            defaultValue={current?.notes ?? ""}
            placeholder="어제 늦게 잠. 오른쪽 무릎 약간 뻐근."
            className="w-full bg-transparent text-zinc-200 text-sm outline-none resize-none placeholder:text-zinc-700"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldCard({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <label className="forge-card rounded-2xl p-4 flex items-end justify-between cursor-text">
      <div>
        <div className="text-zinc-500 text-[10px] uppercase tracking-widest">
          {label}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          {children}
          <span className="text-zinc-500 text-sm">{suffix}</span>
        </div>
      </div>
    </label>
  );
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
