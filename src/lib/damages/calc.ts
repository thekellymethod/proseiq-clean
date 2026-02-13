import { DamagesRequest, DamagesResponse } from "./types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateDamages(req: DamagesRequest): DamagesResponse {
  const assumptions: string[] = [];

  const byCategory: Record<string, number> = {};
  for (const item of req.line_items ?? []) {
    const amt = Number(item.amount);
    if (!isFinite(amt) || amt < 0) continue;
    byCategory[item.category] = round2((byCategory[item.category] ?? 0) + amt);
  }

  const economicCats = ["medical", "lost_wages", "property", "out_of_pocket", "other"];
  const nonEconomicCats = ["emotional"];

  const economic = round2(economicCats.reduce((s, c) => s + (byCategory[c] ?? 0), 0));
  const baseNonEconomic = round2(nonEconomicCats.reduce((s, c) => s + (byCategory[c] ?? 0), 0));
  const punitive = round2(byCategory["punitive"] ?? 0);

  const m = req.multipliers?.pain_suffering ?? null;
  let non_economic = baseNonEconomic;

  if (m && isFinite(m) && m > 0) {
    const applied = round2((economic + baseNonEconomic) * m);
    assumptions.push(`Applied pain/suffering multiplier: ${m}x to (economic + base non-economic).`);
    non_economic = applied;
  } else {
    assumptions.push("No multiplier applied.");
  }

  const total = round2(economic + non_economic + punitive);

  return {
    totals: { economic, non_economic, punitive, total },
    breakdown: {
      by_category: byCategory,
      line_items: req.line_items ?? [],
      assumptions,
    },
  };
}
