"use client";

import React from "react";
import Link from "next/link";

type PinnedItem = {
  citation?: string;
  title?: string;
  summary?: string;
  relevance?: string;
};

export default function AnalysisLegalAuthorities({
  caseId,
  items,
}: {
  caseId: string;
  items: PinnedItem[];
}) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-white font-medium">Applying legal authorities</h4>
          <Link href={`/dashboard/cases/${caseId}/research`} className="text-xs text-amber-200 hover:text-amber-100">
            Pin research
          </Link>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Pin relevant cases, statutes, or rules from Research to apply them here. No pinned authorities yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-white font-medium">Applying legal authorities</h4>
        <Link href={`/dashboard/cases/${caseId}/research`} className="text-xs text-amber-200 hover:text-amber-100">
          View research
        </Link>
      </div>
      <p className="mt-1 text-sm text-white/70">
        Pinned authorities and how they apply to your case. Verify with primary sources.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-xl border border-white/10 bg-black/10 p-3">
            <div className="font-medium text-white">{item.citation || item.title || "Authority"}</div>
            {item.summary ? (
              <div className="mt-1 text-sm text-white/70 line-clamp-2">{item.summary}</div>
            ) : null}
            {item.relevance ? (
              <div className="mt-2 text-xs text-amber-200/90">Application: {item.relevance}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
