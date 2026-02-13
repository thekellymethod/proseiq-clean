"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export type TabKey =
  | "overview"
  | "intake"
  | "parties"
  | "events"
  | "documents"
  | "exhibits"
  | "drafts"
  | "discovery"
  | "motions"
  | "research"
  | "assistant"
  | "export"
  | "analysis"
  | "edit";

type Tab = {
  key: TabKey;
  label: string;
  href: (caseId: string) => string;
  proOnly?: boolean;
};

const TABS: Tab[] = [
  { key: "overview", label: "Overview", href: (id) => `/dashboard/cases/${id}/overview` },
  { key: "intake", label: "Intake", href: (id) => `/dashboard/cases/${id}/intake` },
  { key: "parties", label: "Parties", href: (id) => `/dashboard/cases/${id}/parties` },
  { key: "events", label: "Events", href: (id) => `/dashboard/cases/${id}/events` },
  { key: "documents", label: "Documents", href: (id) => `/dashboard/cases/${id}/documents` },
  { key: "exhibits", label: "Exhibits", href: (id) => `/dashboard/cases/${id}/exhibits` },
  { key: "drafts", label: "Drafts", href: (id) => `/dashboard/cases/${id}/drafts` },
  { key: "discovery", label: "Discovery", href: (id) => `/dashboard/cases/${id}/discovery` },
  { key: "motions", label: "Motions", href: (id) => `/dashboard/cases/${id}/motions` },
  { key: "research", label: "Research", href: (id) => `/dashboard/cases/${id}/research`, proOnly: true },
  { key: "assistant", label: "Assistant", href: (id) => `/dashboard/cases/${id}/assistant`, proOnly: true },
  { key: "export", label: "Export", href: (id) => `/dashboard/cases/${id}/export` },
  { key: "analysis", label: "Analysis", href: (id) => `/dashboard/cases/${id}/analysis`, proOnly: true },
  { key: "edit", label: "Settings", href: (id) => `/dashboard/cases/${id}/edit` },
];

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseTabs({ caseId, active, plan }: { caseId: string; active?: TabKey; plan?: "basic" | "pro" | null }) {
  const reduceMotion = useReducedMotion();
  const isPro = plan === "pro";

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-2"
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === active;
          const showProBadge = t.proOnly && !isPro;
          return (
            <motion.div key={t.key} whileHover={reduceMotion ? {} : { scale: 1.02 }} whileTap={reduceMotion ? {} : { scale: 0.98 }}>
              <Link
                href={t.href(caseId)}
                className={cx(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                    : "border-white/10 bg-black/10 text-white/70 hover:bg-black/20 hover:text-white"
                )}
              >
                {t.label}
                {showProBadge && <span className="text-xs text-white/50">🔒 Pro</span>}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
