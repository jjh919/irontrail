export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          IronTrail
        </div>
        <h1 className="font-serif text-4xl text-white mt-2">
          철의 길로
        </h1>
        <p className="text-zinc-400 text-sm mt-3">
          Supabase Auth 연결 후 구현 예정
        </p>
        <button
          type="button"
          disabled
          className="w-full mt-8 bg-amber-500/50 text-zinc-950 font-bold py-3.5 rounded-2xl cursor-not-allowed"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
