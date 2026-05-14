import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-6 pt-8 space-y-5">
      <div>
        <div className="text-zinc-500 text-xs">설정</div>
        <h1 className="text-white text-2xl font-serif mt-1">계정</h1>
      </div>

      <section className="forge-card rounded-3xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-lg">
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {user?.email ?? "guest"}
          </div>
          <div className="text-zinc-500 text-[11px] mt-0.5">
            로그인 상태
          </div>
        </div>
      </section>

      <section className="forge-card rounded-3xl p-5">
        <p className="text-zinc-400 text-sm">
          대회·존·연동 등 나머지 설정은 다음 단계에서 구현합니다.
        </p>
      </section>

      <form action={signOut} className="pt-2">
        <button
          type="submit"
          className="w-full text-rose-400 text-sm py-3 hover:text-rose-300 transition"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
