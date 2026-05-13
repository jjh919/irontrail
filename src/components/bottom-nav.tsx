"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/calendar", icon: Calendar, label: "캘린더" },
  { href: "/log", icon: Plus, label: "기록", isFab: true },
  { href: "/analysis", icon: BarChart3, label: "분석" },
  { href: "/settings", icon: User, label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800">
      <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                className="w-12 h-12 -mt-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xl shadow-amber-500/40 active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6" strokeWidth={3} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors",
                isActive ? "text-amber-500" : "text-zinc-500",
              )}
            >
              <Icon className="w-5 h-5" />
              <span
                className={cn(
                  "text-[9px]",
                  isActive && "font-semibold",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
