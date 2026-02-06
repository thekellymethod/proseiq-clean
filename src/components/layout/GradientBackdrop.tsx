export default function GradientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-amber-500/22 blur-3xl" />
      <div className="absolute top-12 left-12 h-[460px] w-[460px] rounded-full bg-sky-500/12 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-140px] h-[560px] w-[560px] rounded-full bg-fuchsia-500/12 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-black/45" />
    </div>
  );
}
