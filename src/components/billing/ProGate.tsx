"use client";

import Link from "next/link";

type Feature = "research" | "assistant" | "3d" | "analysis";

const LOCK_CONTENT: Record<Feature, { title: string; bullets: string[] }> = {
  research: {
    title: "Research is a Pro feature.",
    bullets: [
      "Search and structure authority",
      "Pin sources directly to your case",
      "Build a reusable authority library",
    ],
  },
  assistant: {
    title: "AI Assistant is available on Pro.",
    bullets: [
      "Case analysis prompts",
      "Suggested next actions",
      "Structured coaching tools",
    ],
  },
  "3d": {
    title: "3D Timeline view is part of Pro.",
    bullets: ["Visualize your case events spatially and chronologically"],
  },
  analysis: {
    title: "Case analysis is a Pro feature.",
    bullets: [
      "Proactive relevance and focus signals",
      "Suggested next actions and deadlines",
      "Elements checklists and motion watchlists",
    ],
  },
};

export default function ProGate({ feature }: { feature: Feature }) {
  const { title, bullets } = LOCK_CONTENT[feature];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ul className="mt-3 space-y-1 text-sm text-white/70">{bullets.map((b, i) => <li key={i}>• {b}</li>)}</ul>
        <Link
          href="/dashboard/account"
          className="mt-5 inline-block rounded-md border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
