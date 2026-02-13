//src/components/dashboard/KpiCard.tsx
import React from "react";

export default function KpiCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "danger";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-500/10"
      : tone === "warn"
      ? "border-amber-300/25 bg-amber-300/10"
      : tone === "danger"
      ? "border-red-400/20 bg-red-500/10"
      : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
      {sublabel ? <div className="mt-2 text-sm text-white/50">{sublabel}</div> : null}
    </div>
  );
}
