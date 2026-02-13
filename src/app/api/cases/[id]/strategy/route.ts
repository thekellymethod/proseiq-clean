import { NextResponse } from "next/server";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

export async function POST(req: Request) {
  const gate = await requireProPlan();
  if (gate.res) return gate.res;

  const body = await req.json().catch(() => null);
  if (!body?.case_summary || typeof body.case_summary !== "string") {
    return NextResponse.json({ error: "case_summary required" }, { status: 400 });
  }

  return NextResponse.json({
    issues: [
      { title: "Identify required elements", why_it_matters: "Courts decide on elements; missing one loses the issue." },
      { title: "Timeline credibility", why_it_matters: "A clean chronology reduces contradictions and helps persuasion." },
    ],
    evidence_gaps: [
      { gap: "Primary documents for key events", how_to_fill: "Upload the underlying letters, emails, invoices, orders." },
    ],
    next_actions: [
      { action: "Write a one-page case narrative", priority: "high" as const },
      { action: "List exhibits needed to prove each fact", priority: "high" as const },
      { action: "Draft the next motion/filing outline", priority: "medium" as const },
    ],
    risks: [
      { risk: "Missing procedural deadlines", mitigation: "Add deadlines from rules and scheduling orders into Events." },
    ],
  });
}
