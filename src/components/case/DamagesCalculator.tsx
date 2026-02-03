"use client";

import React from "react";

type LineItem = {
  id: string;
  label: string;
  amount: number;
  category: "economic" | "fees" | "transportation" | "lost_wages" | "other";
};

function money(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function DamagesCalculator({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [items, setItems] = React.useState<LineItem[]>([
    { id: "i1", label: "Payments made / out-of-pocket loss", amount: 502, category: "economic" },
    { id: "i2", label: "Bank fees / NSF / overdraft", amount: 500, category: "fees" },
    { id: "i3", label: "Repossession fees", amount: 1247, category: "fees" },
    { id: "i4", label: "Emergency transportation", amount: 0, category: "transportation" },
  ]);

  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [category, setCategory] = React.useState<LineItem["category"]>("economic");

  const totals = React.useMemo(() => {
    const sum = (cat?: LineItem["category"]) =>
      items
        .filter((x) => (cat ? x.category === cat : true))
        .reduce((acc, x) => acc + (Number(x.amount) || 0), 0);

    return {
      economic: sum("economic"),
      fees: sum("fees"),
      transportation: sum("transportation"),
      lost_wages: sum("lost_wages"),
      other: sum("other"),
      total: sum(),
    };
  }, [items]);

  function add() {
    const t = label.trim();
    const n = Number(amount);
    if (!t || !Number.isFinite(n)) return;

    const next: LineItem = {
      id: `d_${Math.random().toString(16).slice(2)}`,
      label: t,
      amount: n,
      category,
    };

    setItems((prev) => [next, ...prev]);
    setLabel("");
    setAmount("");

    // TODO: Persist to: POST /api/cases/[caseId]/damages
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
    // TODO: DELETE /api/cases/[caseId]/damages/[id]
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Damages Calculator</h3>
        <p className="text-sm text-white/70">
          Build a defensible damages number with line-item traceability.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-white/70">Running total</div>
            <div className="text-xl font-semibold text-amber-100">{money(totals.total)}</div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Metric label="Economic" value={money(totals.economic)} />
            <Metric label="Fees" value={money(totals.fees)} />
            <Metric label="Transportation" value={money(totals.transportation)} />
            <Metric label="Lost wages" value={money(totals.lost_wages)} />
          </div>

          <div className="mt-4">
            {items.length === 0 ? (
              <div className="text-sm text-white/70">No line items yet.</div>
            ) : (
              <ul className="space-y-2">
                {items.map((x) => (
                  <li key={x.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">{x.label}</div>
                        <div className="mt-1 text-xs text-white/60">{x.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white">{money(x.amount)}</div>
                        {!readOnly ? (
                          <button
                            onClick={() => remove(x.id)}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                placeholder="e.g., Rental car costs"
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
                onChange={(e) => setCategory(e.target.value as any)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                <option value="economic">economic</option>
                <option value="fees">fees</option>
                <option value="transportation">transportation</option>
                <option value="lost_wages">lost_wages</option>
                <option value="other">other</option>
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

          <div className="mt-4 text-xs text-white/50">
            Tip: every line item should have a document behind it (receipt, bank ledger, invoice).
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50">
        Case: <span className="text-white/70">{caseId}</span>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}
