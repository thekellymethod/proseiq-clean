"use client";

import React from "react";
import type { DamagesCategory, DamagesLineItem } from "@/lib/damages/types";

function money(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const CATEGORIES: DamagesCategory[] = [
  "medical",
  "lost_wages",
  "property",
  "out_of_pocket",
  "emotional",
  "punitive",
  "other",
];

export default function DamagesCalculator({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [items, setItems] = React.useState<DamagesLineItem[]>([
    { category: "out_of_pocket", label: "Out-of-pocket expenses", amount: 0 },
    { category: "lost_wages", label: "Lost wages", amount: 0 },
    { category: "property", label: "Property damage", amount: 0 },
  ]);

  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [category, setCategory] = React.useState<DamagesCategory>("other");

  const [multiplier, setMultiplier] = React.useState<string>("");
  const [result, setResult] = React.useState<{
    totals: { economic: number; non_economic: number; punitive: number; total: number };
    assumptions: string[];
  } | null>(null);
  const [computing, setComputing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lineItemsForApi = React.useMemo(() => {
    return items.map(({ category: c, label: l, amount: a }) => ({
      category: c,
      label: l,
      amount: Number(a) || 0,
    }));
  }, [items]);

  function add() {
    const t = label.trim();
    const n = Number(amount);
    if (!t || !Number.isFinite(n)) return;

    setItems((prev) => [{ category, label: t, amount: n }, ...prev]);
    setLabel("");
    setAmount("");
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function compute() {
    setError(null);
    setResult(null);
    setComputing(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/damages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          line_items: lineItemsForApi,
          multipliers: multiplier ? { pain_suffering: Number(multiplier) || null } : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Compute failed");
      setResult({
        totals: json.totals,
        assumptions: json.breakdown?.assumptions ?? [],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Compute failed");
    } finally {
      setComputing(false);
    }
  }

  const runningTotal = items.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Damages Calculator</h3>
        <p className="text-sm text-white/70">
          Build a defensible damages number with line-item traceability.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-white/70">Running total</div>
              <div className="text-xl font-semibold text-amber-100">{money(runningTotal)}</div>
            </div>

            {result && (
              <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
                <div className="text-sm font-medium text-white">Computed breakdown</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="text-xs text-white/70">Economic: {money(result.totals.economic)}</div>
                  <div className="text-xs text-white/70">Non-economic: {money(result.totals.non_economic)}</div>
                  <div className="text-xs text-white/70">Punitive: {money(result.totals.punitive)}</div>
                  <div className="text-xs font-medium text-amber-100">Total: {money(result.totals.total)}</div>
                </div>
                {result.assumptions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.assumptions.map((a, i) => (
                      <div key={i} className="text-xs text-white/60">{a}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              {items.length === 0 ? (
                <div className="text-sm text-white/70">No line items yet.</div>
              ) : (
                <ul className="space-y-2">
                  {items.map((x, idx) => (
                    <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-white">{x.label}</div>
                          <div className="mt-1 text-xs text-white/60">{x.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-white">{money(x.amount)}</div>
                          {!readOnly && (
                            <button
                              onClick={() => remove(idx)}
                              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add line item</h4>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="e.g., Medical bills"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                inputMode="decimal"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DamagesCategory)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={add}
              disabled={!!readOnly}
              className={cx(
                "w-full rounded-md px-3 py-2 text-sm font-medium",
                "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
                readOnly && "opacity-60"
              )}
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs text-white/70">Pain/suffering multiplier (optional)</label>
            <input
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              disabled={!!readOnly}
              className={cx(
                "w-full rounded-md border px-3 py-2 text-sm",
                "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                readOnly && "opacity-60"
              )}
              inputMode="decimal"
              placeholder="e.g., 1.5, 2, 3"
            />
          </div>

          <button
            onClick={compute}
            disabled={!!readOnly || computing || items.length === 0}
            className={cx(
              "mt-4 w-full rounded-md px-3 py-2 text-sm font-medium",
              "border border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20",
              (readOnly || computing || items.length === 0) && "opacity-60"
            )}
          >
            {computing ? "Computing…" : "Compute breakdown"}
          </button>

          <div className="mt-4 text-xs text-white/50">
            Tip: every line item should have a document behind it (receipt, bank ledger, invoice).
          </div>
        </div>
      </div>
    </section>
  );
}
