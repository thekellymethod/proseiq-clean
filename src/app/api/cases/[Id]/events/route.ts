import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, context: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caseId = context.params.id;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 500);

  const { data, error } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .eq("case_id", caseId)
    .order("event_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, context: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caseId = context.params.id;

  const body = await req.json().catch(() => ({}));
  const { event_at, title, kind = "note", notes = null } = body ?? {};

  if (!event_at || !title) {
    return NextResponse.json({ error: "event_at and title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_events")
    .insert({
      case_id: caseId,
      event_at,
      title,
      kind,
      notes,
    })
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
