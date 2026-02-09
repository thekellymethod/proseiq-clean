import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user: auth.user, res: null as any };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 2000);

  let query = supabase
    .from("case_drafts")
    .select("id,case_id,title,kind,status,template_id,created_at,updated_at")
    .eq("case_id", id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) return bad(error.message, 400);

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return bad("title required", 400);

  const payload: any = {
    case_id: id,
    created_by: user.id,
    title,
    kind: body?.kind ?? "draft",
    status: body?.status ?? "draft",
    content: body?.content ?? "",
    content_rich: body?.content_rich ?? null,
    template_id: body?.template_id ?? null,
  };

  const { data, error } = await supabase
    .from("case_drafts")
    .insert(payload)
    .select("id,case_id,title,kind,status,template_id,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}
