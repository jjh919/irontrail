"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "../actions";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUp,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="email" className="block text-zinc-400 text-xs mb-1.5">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none transition"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-zinc-400 text-xs mb-1.5"
        >
          비밀번호 <span className="text-zinc-600">(8자 이상)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none transition"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-rose-300 text-xs">
          {state.error}
        </div>
      )}

      {state?.message && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-amber-300 text-xs">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
      >
        {isPending ? "가입 중..." : "회원가입"}
      </button>

      <div className="pt-2 text-center text-xs text-zinc-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-amber-400 font-semibold">
          로그인
        </Link>
      </div>
    </form>
  );
}
