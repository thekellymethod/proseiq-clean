import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireProPlan } from "@/lib/billing/requireActiveSub";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const BodySchema = z.object({
  query: z.string().min(2),
  jurisdiction: z.string().optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

type SerperOrganic = { title?: string; link?: string; snippet?: string };

function stripHtmlToText(html: string) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "ProseIQ/1.0 (research fetch)",
      },
    });
    if (!res.ok) return "";
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return "";
    const raw = await res.text();
    const txt = stripHtmlToText(raw);
    return txt.slice(0, 4000);
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

const ResearchHitSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  citation: z.string(),
  quotedText: z.string().optional().default(""),
  summary: z.string(),
  whyRelevant: z.string(),
  relevanceScore: z.number().int().min(0).max(100),
  strength: z.enum(["high", "medium", "low"]),
  confidence: z.number().min(0).max(1),
});

const ResearchResponseSchema = z.object({
  hits: z.array(ResearchHitSchema).max(10),
  notes: z.string().optional().default(""),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireProPlan();
  if (res) return res;

  const { id: caseId } = await params;
  const bodyRaw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(bodyRaw);
  if (!parsed.success) return bad("Invalid request body", 400);

  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return bad("Research is not configured (missing SERPER_API_KEY).", 501);
  if (!process.env.OPENAI_API_KEY) return bad("AI is not configured (missing OPENAI_API_KEY).", 501);

  const { query, jurisdiction, limit } = parsed.data;
  const num = limit ?? 6;

  // Confirm case ownership (fail fast)
  const { data: c, error: cErr } = await supabase
    .from("cases")
    .select("id,title,status")
    .eq("id", caseId)
    .eq("created_by", user.id)
    .maybeSingle();
  if (cErr) return bad(cErr.message, 400);
  if (!c) return bad("Not found", 404);

  const { data: intake } = await supabase.from("case_intakes").select("intake").eq("case_id", caseId).maybeSingle();

  let serper: any;
  try {
    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num,
      }),
    });
    serper = await serperRes.json().catch(() => ({}));
    if (!serperRes.ok) {
      return bad(serper?.message || `Serper request failed (${serperRes.status})`, 502);
    }
  } catch (e: any) {
    return bad(e?.message ?? "Serper request failed", 502);
  }

  const organic: SerperOrganic[] = Array.isArray(serper?.organic) ? serper.organic : [];
  const top = organic
    .map((r) => ({
      title: String(r.title ?? "").trim(),
      url: String(r.link ?? "").trim(),
      snippet: String(r.snippet ?? "").trim(),
    }))
    .filter((r) => r.url && r.title)
    .slice(0, num);

  const pageTexts = await Promise.all(
    top.map(async (r) => ({
      url: r.url,
      text: await fetchPageText(r.url),
    }))
  );

  const sources = top.map((r) => {
    const extra = pageTexts.find((p) => p.url === r.url)?.text ?? "";
    return {
      title: r.title,
      url: r.url,
      snippet: r.snippet,
      extractedText: extra,
    };
  });

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = [
    "You are a careful legal research assistant.",
    "Return structured results with citations and short quotes when available.",
    "Do not fabricate citations. If unsure, lower confidence and rely only on provided sources.",
    "This is multi-state; prefer generally applicable sources (statutes/rules) unless jurisdiction is provided.",
  ].join(" ");

  const prompt = [
    `Case: ${c.title} (status: ${c.status})`,
    jurisdiction ? `Preferred jurisdiction: ${jurisdiction}` : "Preferred jurisdiction: (not provided)",
    "",
    `User query: ${query}`,
    "",
    "Sources (use these; do not invent):",
    JSON.stringify(sources, null, 2),
    "",
    "Task: produce up to 6 research hits. Each hit should include:",
    "- title, url",
    "- citation (statute/rule/case name or doc title; must match source)",
    "- quotedText (a short quote from the source if available; otherwise empty)",
    "- summary and whyRelevant (plain English)",
    "- relevanceScore 0-100 and strength (high/medium/low)",
    "- confidence 0-1",
    "",
    "Be conservative: if sources are thin, return fewer hits.",
    intake?.intake ? `\nOptional case intake context (JSON):\n${JSON.stringify(intake.intake).slice(0, 4000)}` : "",
  ].join("\n");

  const out = await generateObject({
    model: openai(modelName),
    system,
    prompt,
    schema: ResearchResponseSchema,
    temperature: 0.2,
  });

  const hits = out.object.hits ?? [];

  // Persist hits for audit/pinning.
  const rows = hits.map((h) => ({
    case_id: caseId,
    created_by: user.id,
    output_type: "research_hit",
    title: h.citation || h.title,
    content: h,
    metadata: {
      query,
      jurisdiction: jurisdiction ?? null,
      sources: sources.map((s) => ({ title: s.title, url: s.url })),
      model: modelName,
    },
    pinned: false,
  }));

  const { data: inserted, error: insErr } = await supabase
    .from("case_ai_outputs")
    .insert(rows)
    .select("id,case_id,output_type,title,content,metadata,pinned,created_at,updated_at");

  if (insErr) return bad(insErr.message, 400);

  return NextResponse.json({
    hits: (inserted ?? []).map((r: any) => ({
      id: r.id,
      pinned: r.pinned,
      ...(r.content ?? {}),
    })),
    notes: out.object.notes ?? "",
  });
}

