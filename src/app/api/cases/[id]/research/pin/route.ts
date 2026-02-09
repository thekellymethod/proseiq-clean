import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
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
  outputId: z.string().uuid(),
  pinned: z.boolean(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id: caseId } = await params;

  const { data, error } = await supabase
    .from("case_ai_outputs")
    .select("id,title,content,metadata,pinned,created_at,updated_at")
    .eq("case_id", caseId)
    .eq("created_by", user.id)
    .eq("output_type", "research_hit")
    .eq("pinned", true)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) return bad(error.message, 400);
  return NextResponse.json({
    items: (data ?? []).map((r: any) => ({ id: r.id, pinned: r.pinned, ...(r.content ?? {}) })),
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id: caseId } = await params;
  const bodyRaw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(bodyRaw);
  if (!parsed.success) return bad("Invalid request body", 400);

  const { outputId, pinned } = parsed.data;

  const { data, error } = await supabase
    .from("case_ai_outputs")
    .update({ pinned })
    .eq("id", outputId)
    .eq("case_id", caseId)
    .eq("created_by", user.id)
    .select("id,content,pinned")
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!data) return bad("Not found", 404);

  return NextResponse.json({ item: { id: data.id, pinned: data.pinned, ...(data.content ?? {}) } });
}

