import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const BodySchema = z.object({
  target: z.string().min(1), // person/org
  categories: z.array(z.string()).min(1), // requested document categories
  timeRange: z.string().optional(),
  purpose: z.string().min(1),
  jurisdiction: z.string().optional(),
});

const OutputSchema = z.object({
  overview: z.string(),
  checklist: z.array(z.string()).min(5),
  documentRequests: z.array(z.string()).min(5),
  narrowingTips: z.array(z.string()).default([]),
  serviceAndComplianceNotes: z.array(z.string()).default([]),
  pitfalls: z.array(z.string()).default([]),
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

  const { data: c, error: cErr } = await supabase.from("cases").select("id,title,status").eq("id", caseId).eq("created_by", user.id).maybeSingle();
  if (cErr) return bad(cErr.message, 400);
  if (!c) return bad("Not found", 404);

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = [
    "You are a careful litigation coach for a pro se user.",
    "Provide educational guidance, not legal advice.",
    "Do not draft jurisdiction-specific subpoena form text; instead provide a duces tecum planning checklist and narrowly tailored request categories.",
    "Be conservative and avoid encouraging harassment or overbroad fishing expeditions.",
  ].join(" ");

  const prompt = [
    `Case: ${c.title} (status: ${c.status})`,
    parsed.data.jurisdiction ? `Jurisdiction: ${parsed.data.jurisdiction}` : "Jurisdiction: (not provided)",
    "",
    `Target custodian: ${parsed.data.target}`,
    `Purpose: ${parsed.data.purpose}`,
    parsed.data.timeRange ? `Time range: ${parsed.data.timeRange}` : "",
    `Categories: ${parsed.data.categories.join("; ")}`,
    "",
    "Deliver:",
    "- A step-by-step subpoena duces tecum planning checklist (what to check in local rules, notice, time, fees, objections).",
    "- A list of narrowly-tailored document request categories (no form language).",
    "- Narrowing tips, service/compliance notes, pitfalls.",
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
    output_type: "subpoena",
    title: `Subpoena duces tecum plan: ${parsed.data.target}`,
    content,
    metadata: { model: modelName, target: parsed.data.target },
    pinned: false,
  });

  return NextResponse.json({ item: content });
}

