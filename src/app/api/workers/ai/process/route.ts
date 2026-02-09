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

const OutputSchema = z.object({
  output_type: z.string(),
  title: z.string(),
  confidence: z.number().min(0).max(1),
  relevance: z.enum(["essential", "supporting", "unclear", "irrelevant"]),
  reasons: z.array(z.string()).default([]),
  nextActions: z.array(z.string()).default([]),
  deadlines: z
    .array(
      z.object({
        title: z.string(),
        dueISO: z.string().optional().default(""),
        notes: z.string().optional().default(""),
      })
    )
    .default([]),
  motions: z.array(z.string()).default([]),
  elementsChecklist: z.array(z.string()).default([]),
  rabbitTrails: z.array(z.string()).default([]),
});

const WorkerResultSchema = z.object({
  outputs: z.array(OutputSchema).max(8),
  notes: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  if (!process.env.OPENAI_API_KEY) return bad("AI is not configured (missing OPENAI_API_KEY).", 501);

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 5), 1), 20);

  // Take queued jobs owned by this user.
  const { data: jobs, error: jErr } = await supabase
    .from("case_ai_jobs")
    .select("id,case_id,job_type,source_type,source_id,payload,attempts,created_at")
    .eq("created_by", user.id)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (jErr) return bad(jErr.message, 400);
  if (!jobs || jobs.length === 0) return NextResponse.json({ processed: 0, outputsCreated: 0 });

  let outputsCreated = 0;
  const processedIds: string[] = [];

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = [
    "You are a careful litigation coach for pro se users.",
    "Be multi-state by default and avoid pretending to know local rules unless the user provides them.",
    "Flag irrelevant/rabbit-trail items.",
    "Return structured outputs only; be conservative on deadlines and label uncertainties.",
    "Do not provide legal advice; provide educational guidance and suggest verifying with primary sources and local rules.",
  ].join(" ");

  for (const job of jobs) {
    try {
      // Load minimal case context.
      const { data: c } = await supabase.from("cases").select("id,title,status").eq("id", job.case_id).maybeSingle();
      const { data: intake } = await supabase.from("case_intakes").select("intake").eq("case_id", job.case_id).maybeSingle();

      const context = {
        case: c ?? { id: job.case_id },
        job,
        intake: intake?.intake ?? null,
      };

      const prompt = [
        "Analyze the new/updated case item and produce outputs that help the user stay focused and meet deadlines.",
        "",
        "Return outputs that can be shown in a Focus panel:",
        "- relevance classification (essential/supporting/unclear/irrelevant) and reasons",
        "- nextActions (<=5)",
        "- possible motions (if appropriate)",
        "- elementsChecklist (what must be proven / what evidence is missing) (<=8 items)",
        "- rabbitTrails (things to avoid) (<=5 items)",
        "- deadlines: only if strongly suggested; otherwise leave empty",
        "",
        `Context JSON:\n${JSON.stringify(context).slice(0, 8000)}`,
      ].join("\n");

      const out = await generateObject({
        model: openai(modelName),
        system,
        prompt,
        schema: WorkerResultSchema,
        temperature: 0.2,
      });

      const outputs = out.object.outputs ?? [];

      if (outputs.length) {
        const rows = outputs.map((o) => ({
          case_id: job.case_id,
          created_by: user.id,
          output_type: o.output_type || "case_analysis",
          source_type: job.source_type ?? null,
          source_id: job.source_id ?? null,
          title: o.title,
          content: o,
          metadata: {
            job_id: job.id,
            job_type: job.job_type,
            model: modelName,
          },
          pinned: false,
        }));

        const { error: oErr } = await supabase.from("case_ai_outputs").insert(rows);
        if (oErr) throw new Error(oErr.message);
        outputsCreated += rows.length;
      }

      // Mark job done.
      const { error: uErr } = await supabase
        .from("case_ai_jobs")
        .update({ status: "done" })
        .eq("id", job.id)
        .eq("created_by", user.id);
      if (uErr) throw new Error(uErr.message);

      processedIds.push(job.id);
    } catch (e: any) {
      await supabase
        .from("case_ai_jobs")
        .update({
          status: "error",
          attempts: (job.attempts ?? 0) + 1,
          error: String(e?.message ?? "Worker failed").slice(0, 800),
        })
        .eq("id", job.id)
        .eq("created_by", user.id);
      processedIds.push(job.id);
    }
  }

  return NextResponse.json({ processed: processedIds.length, outputsCreated });
}

