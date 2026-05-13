import { Bell, Play } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="px-6 pt-8 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-zinc-500 text-xs">좋은 아침이에요</div>
          <div className="text-white text-lg font-semibold mt-0.5">
            민호님 <span className="text-amber-500">·</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="알림"
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 active:bg-zinc-800"
        >
          <Bell className="w-4 h-4" />
        </button>
      </header>

      {/* D-day hero card */}
      <section className="forge-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-500/10 blur-xl" />
        <div className="absolute -right-2 top-2 text-amber-500 text-xs font-medium tracking-wide">
          속초 · Olympic
        </div>

        <div className="text-zinc-500 text-xs mb-1 relative">대회까지</div>
        <div className="flex items-baseline gap-2 relative">
          <div className="font-mono text-white text-6xl font-bold tracking-tighter forge-num leading-none">
            87
          </div>
          <div className="text-zinc-400 text-sm">일 남았어요</div>
        </div>

        <div className="mt-5 flex items-center gap-2 relative">
          <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              style={{ width: "50%" }}
            />
          </div>
          <div className="text-zinc-500 text-[11px] font-mono">BUILD 8/16</div>
        </div>
      </section>

      {/* Today's workout */}
      <section>
        <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3 px-1">
          오늘의 훈련
        </div>
        <div className="forge-card rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
              🏊
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-base">인터벌 수영</div>
              <div className="text-zinc-500 text-xs mt-0.5">
                45분 · 중강도 ●●●○○
              </div>
            </div>
          </div>

          <div className="mt-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4">
            <div className="text-zinc-300 text-sm leading-relaxed">
              100m × 10세트, 인터벌 20초
              <br />
              목표 페이스{" "}
              <span className="text-amber-400 font-mono font-bold">
                1:45/100m
              </span>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              시작하기
            </button>
            <button
              type="button"
              className="px-5 py-3.5 text-zinc-400 text-sm bg-zinc-900 border border-zinc-800 rounded-2xl"
            >
              미루기
            </button>
          </div>
        </div>
      </section>

      {/* Condition */}
      <section>
        <div className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3 px-1">
          컨디션
        </div>
        <Link
          href="/log"
          className="forge-card rounded-3xl p-5 flex items-center justify-around active:bg-zinc-900/50 transition"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">😴</div>
            <div className="text-white font-mono font-bold">
              7.2<span className="text-xs text-zinc-500 font-sans">h</span>
            </div>
            <div className="text-zinc-500 text-[10px] mt-0.5">수면</div>
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-white font-mono font-bold">
              3<span className="text-xs text-zinc-500 font-sans">/10</span>
            </div>
            <div className="text-zinc-500 text-[10px] mt-0.5">피로</div>
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div className="text-center">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="text-white font-mono font-bold">
              68.4
              <span className="text-xs text-zinc-500 font-sans">kg</span>
            </div>
            <div className="text-zinc-500 text-[10px] mt-0.5">체중</div>
          </div>
        </Link>
      </section>

      {/* Week progress */}
      <section className="forge-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-semibold">이번 주 잘 가고 있어요</div>
            <div className="text-zinc-500 text-xs mt-0.5">
              계획 6회 중 4회 완료
            </div>
          </div>
          <div className="relative w-14 h-14">
            <div
              className="absolute inset-0 rounded-full shadow-[0_0_16px_rgba(245,158,11,0.3)]"
              style={{
                background:
                  "conic-gradient(#f59e0b 0% 65%, #27272a 65% 100%)",
              }}
            />
            <div className="absolute inset-1.5 bg-zinc-950 rounded-full flex items-center justify-center">
              <span className="text-amber-400 font-mono font-bold text-sm">
                65%
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end gap-1.5 mt-4">
          {[
            { day: "월", height: "h-10", color: "bg-amber-500/40" },
            { day: "화", height: "h-14", color: "bg-amber-500/70" },
            { day: "수", height: "h-2", color: "bg-zinc-800" },
            { day: "목", height: "h-12", color: "bg-amber-500/60" },
            {
              day: "금",
              height: "h-8",
              color: "bg-amber-500",
              isToday: true,
            },
            { day: "토", height: "h-2", color: "bg-zinc-900 border border-zinc-800" },
            { day: "일", height: "h-2", color: "bg-zinc-900 border border-zinc-800" },
          ].map((d) => (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-full ${d.height} ${d.color} rounded-lg ${d.isToday ? "ring-2 ring-amber-500/30 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : ""}`}
              />
              <div
                className={`text-[10px] font-mono ${d.isToday ? "text-amber-400 font-bold" : "text-zinc-500"}`}
              >
                {d.day}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
