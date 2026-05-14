import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            IronTrail
          </div>
          <h1 className="font-serif text-4xl text-white mt-3">함께 시작</h1>
          <p className="text-zinc-500 text-sm mt-2">
            철인이 되어가는 여정의 첫 페이지
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
