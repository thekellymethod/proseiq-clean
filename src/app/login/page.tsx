import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen text-white">
      {/* ProseIQ navy -> gold background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#071225] via-[#0B1B3A] to-[#B8891A]" />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-xl font-semibold tracking-wide">
            Prose<span className="text-amber-300">IQ</span>
          </h1>

          <p className="mt-1 text-sm text-white/70">
            Sign in to your private case workspace.
          </p>

          {/* ✅ THIS is the missing piece */}
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
