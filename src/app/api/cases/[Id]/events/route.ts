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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "").trim();
  const from = (url.searchParams.get("from") ?? "").trim();
  const to = (url.searchParams.get("to") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 500), 1), 2000);

  let query = supabase
    .from("case_events")
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .eq("case_id", params.id)
    .order("event_at", { ascending: true })
    .limit(limit);

  if (kind) query = query.eq("kind", kind);
  if (from) query = query.gte("event_at", from);
  if (to) query = query.lte("event_at", to);

  const { data, error } = await query;
  if (error) return bad(error.message, 400);

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const event_at = String(body?.event_at ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const kind = String(body?.kind ?? "note").trim();
  const notes = body?.notes ?? null;

  if (!event_at || !title) return bad("event_at and title required", 400);

  const { data, error } = await supabase
    .from("case_events")
    .insert({ case_id: params.id, event_at, title, kind, notes })
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}
