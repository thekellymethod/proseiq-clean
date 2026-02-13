import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const BodySchema = z.object({
  witnessName: z.string().min(1),
  purpose: z.string().min(1),
  facts: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const OutputSchema = z.object({
  overview: z.string(),
  prepChecklist: z.array(z.string()).min(3),
  directExamOutline: z.array(z.string()).min(3),
  exhibitsToPrepare: z.array(z.string()).default([]),
  risksAndWeaknesses: z.array(z.string()).default([]),
  credibilityTips: z.array(z.string()).default([]),
  doNotDo: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireProPlan();
  if (res) return res;
  if (!process.env.OPENAI_API_KEY) return bad("AI is not configured (missing OPENAI_API_KEY).", 501);

  const { id: caseId } = await params;

  const bodyRaw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(bodyRaw);
  if (!parsed.success) return bad("Invalid request body", 400);

  // ownership check
  const { data: c, error: cErr } = await supabase.from("cases").select("id,title,status").eq("id", caseId).eq("created_by", user.id).maybeSingle();
  if (cErr) return bad(cErr.message, 400);
  if (!c) return bad("Not found", 404);

  const { data: intake } = await supabase.from("case_intakes").select("intake").eq("case_id", caseId).maybeSingle();

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = [
    "You are a careful litigation coach for a pro se user.",
    "Provide educational guidance, not legal advice.",
    "Be multi-state by default. If jurisdiction is provided, adapt terminology but avoid claiming specific local rules unless supplied.",
    "Keep the user focused: tie questions to elements and exhibits; avoid rabbit trails.",
  ].join(" ");

  const prompt = [
    `Case: ${c.title} (status: ${c.status})`,
    parsed.data.jurisdiction ? `Jurisdiction: ${parsed.data.jurisdiction}` : "Jurisdiction: (not provided)",
    "",
    `Witness: ${parsed.data.witnessName}`,
    `Purpose: ${parsed.data.purpose}`,
    parsed.data.facts ? `Known facts about this witness:\n${parsed.data.facts}` : "",
    "",
    intake?.intake ? `Case intake context (JSON):\n${JSON.stringify(intake.intake).slice(0, 5000)}` : "",
    "",
    "Deliver: a prep checklist, a direct-exam outline (question topics), exhibits to prepare, risks/weaknesses, credibility tips, and what NOT to do.",
    "Be specific and practical.",
  ]
    .filter(Boolean)
    .join("\n");

  const out = await generateObject({
    model: openai(modelName),
    system,
    prompt,
    schema: OutputSchema,
    temperature: 0.2,
  });

  const content = out.object;
  await supabase.from("case_ai_outputs").insert({
    case_id: caseId,
    created_by: user.id,
    output_type: "witness_prep",
    title: `Witness prep: ${parsed.data.witnessName}`,
    content,
    metadata: { model: modelName, witnessName: parsed.data.witnessName, purpose: parsed.data.purpose },
    pinned: false,
  });

  return NextResponse.json({ item: content });
}

