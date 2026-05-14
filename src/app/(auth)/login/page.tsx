import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            IronTrail
          </div>
          <h1 className="font-serif text-4xl text-white mt-3">철의 길로</h1>
          <p className="text-zinc-500 text-sm mt-2">
            오늘의 한 걸음을 기록하세요
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-72 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
