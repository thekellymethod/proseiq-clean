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
    weakest_points: [
      { point: "Gaps in documentary support", why_opponent_wins: "If it is not documented, they argue it did not happen." },
      { point: "Causation chain", why_opponent_wins: "They argue your damages are not directly caused by their act." },
    ],
    counter_moves: [
      { move: "Attack credibility of your timeline", how_to_counter: "Anchor each event to a document or witness." },
      { move: "Argue you failed to mitigate", how_to_counter: "Document reasonable steps taken to reduce harm." },
    ],
    questions_to_answer: [
      "What is your best evidence for each key fact?",
      "Which element is hardest to prove, and what supports it?",
      "What would a neutral judge find unclear?",
    ],
    settlement_pressure_points: [
      "Cost of discovery vs. value of claim",
      "Risk of fee shifting or sanctions if procedure is mishandled",
    ],
  });
}
