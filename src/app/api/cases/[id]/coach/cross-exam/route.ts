import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user: auth.user, res: null as any };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const BodySchema = z.object({
  witnessName: z.string().min(1),
  goals: z.array(z.string()).min(1),
  expectedTestimony: z.string().optional(),
  impeachmentMaterials: z.array(z.string()).optional(),
  jurisdiction: z.string().optional(),
});

const OutputSchema = z.object({
  overview: z.string(),
  theme: z.string(),
  chapters: z.array(z.object({ title: z.string(), leadingQuestions: z.array(z.string()).min(3) })).min(2),
  impeachmentPlan: z.array(z.string()).default([]),
  objectionsToAnticipate: z.array(z.string()).default([]),
  doNotAsk: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;
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
    "Cross-examination: use leading questions, keep tight control, avoid open-ended questions.",
    "Be multi-state by default; do not claim specific local rules.",
  ].join(" ");

  const prompt = [
    `Case: ${c.title} (status: ${c.status})`,
    parsed.data.jurisdiction ? `Jurisdiction: ${parsed.data.jurisdiction}` : "Jurisdiction: (not provided)",
    "",
    `Witness: ${parsed.data.witnessName}`,
    `Goals: ${parsed.data.goals.join("; ")}`,
    parsed.data.expectedTestimony ? `Expected testimony:\n${parsed.data.expectedTestimony}` : "",
    parsed.data.impeachmentMaterials?.length ? `Impeachment materials:\n- ${parsed.data.impeachmentMaterials.join("\n- ")}` : "",
    "",
    "Deliver: a cross-exam theme, 2-5 chapters with leading questions, an impeachment plan, objections to anticipate, and a do-not-ask list.",
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
    output_type: "cross_exam",
    title: `Cross-exam: ${parsed.data.witnessName}`,
    content,
    metadata: { model: modelName, witnessName: parsed.data.witnessName },
    pinned: false,
  });

  return NextResponse.json({ item: content });
}

