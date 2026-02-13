import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const BodySchema = z.object({
  prompt: z.string().min(1),
  // If true, we will instruct the model to return JSON only.
  json: z.boolean().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireProPlan();
  if (res) return res;

  const { id } = await params;
  const bodyRaw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(bodyRaw);
  if (!parsed.success) return bad("Invalid request body", 400);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return bad("AI is not configured (missing OPENAI_API_KEY).", 501);
  }

  // Confirm the case belongs to the current user (RLS should enforce too, but fail fast).
  const { data: c, error: cErr } = await supabase.from("cases").select("id").eq("id", id).eq("created_by", user.id).maybeSingle();
  if (cErr) return bad(cErr.message, 400);
  if (!c) return bad("Not found", 404);

  const { prompt, json } = parsed.data;
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = json
    ? "You are a legal assistant. Return ONLY valid JSON, no markdown, no prose."
    : "You are a legal assistant. Be concise and practical.";

  const out = await generateText({
    model: openai(modelName),
    system,
    prompt,
    temperature: 0.2,
  });

  if (json) {
    try {
      const obj = JSON.parse(out.text);
      return NextResponse.json({ json: obj });
    } catch {
      // Fall back to raw text (client can surface parse error).
      return NextResponse.json({ text: out.text, error: "Model did not return valid JSON" }, { status: 502 });
    }
  }

  return NextResponse.json({ text: out.text });
}

