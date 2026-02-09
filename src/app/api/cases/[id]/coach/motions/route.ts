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
  goal: z.string().min(1),
  currentStage: z.string().optional(), // pleadings, discovery, pretrial, trial, post-judgment
  jurisdiction: z.string().optional(),
});

const OutputSchema = z.object({
  overview: z.string(),
  motionsToConsider: z.array(z.object({ name: z.string(), when: z.string(), why: z.string(), prerequisites: z.array(z.string()).default([]) })).min(3),
  deadlineWatchlist: z.array(z.string()).default([]),
  onRecordTips: z.array(z.string()).default([]),
  localRulesChecklist: z.array(z.string()).default([]),
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

  const { data: intake } = await supabase.from("case_intakes").select("intake").eq("case_id", caseId).maybeSingle();
  const { data: events } = await supabase
    .from("case_events")
    .select("id,event_at,kind,title")
    .eq("case_id", caseId)
    .order("event_at", { ascending: true })
    .limit(200);

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = [
    "You are a careful litigation coach for a pro se user.",
    "Provide educational guidance, not legal advice.",
    "This is multi-state: describe common motions and when they may be appropriate; do not invent local deadlines.",
    "Emphasize verifying local rules and scheduling orders.",
  ].join(" ");

  const prompt = [
    `Case: ${c.title} (status: ${c.status})`,
    parsed.data.jurisdiction ? `Jurisdiction: ${parsed.data.jurisdiction}` : "Jurisdiction: (not provided)",
    parsed.data.currentStage ? `Stage: ${parsed.data.currentStage}` : "Stage: (not provided)",
    `User goal: ${parsed.data.goal}`,
    "",
    intake?.intake ? `Intake (JSON):\n${JSON.stringify(intake.intake).slice(0, 5000)}` : "",
    events?.length ? `Events (chronological):\n${JSON.stringify(events).slice(0, 5000)}` : "",
    "",
    "Deliver:",
    "- motionsToConsider: at least 3 items, each with name, when, why, prerequisites\n+    - deadlineWatchlist: key deadlines to track (generic)\n+    - onRecordTips: how to preserve issues / make a clear record\n+    - localRulesChecklist: what to look for in local rules and standing orders\n+    - confidence 0-1\n+    Keep it focused and avoid rabbit trails.",
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
    output_type: "motion_recommendation",
    title: "Motions + deadlines plan",
    content,
    metadata: { model: modelName, goal: parsed.data.goal, stage: parsed.data.currentStage ?? null },
    pinned: false,
  });

  return NextResponse.json({ item: content });
}

