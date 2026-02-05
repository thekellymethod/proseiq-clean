import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .eq("case_id", params.id)
    .order("event_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event_at = String(body.event_at ?? "").trim();
  const title = String(body.title ?? "").trim();
  const kind = String(body.kind ?? "note").trim();
  const notes = body.notes == null ? null : String(body.notes);

  if (!event_at || !title) {
    return NextResponse.json({ error: "event_at and title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_events")
    .insert({ case_id: params.id, event_at, title, kind, notes })
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const eventId = String(body.id ?? "").trim();
  if (!eventId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: any = {};
  if (body.event_at != null) patch.event_at = String(body.event_at).trim();
  if (body.title != null) patch.title = String(body.title).trim();
  if (body.kind != null) patch.kind = String(body.kind).trim();
  if (body.notes !== undefined) patch.notes = body.notes == null ? null : String(body.notes);

  const { data, error } = await supabase
    .from("case_events")
    .update(patch)
    .eq("id", eventId)
    .eq("case_id", params.id)
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const { error } = await supabase
    .from("case_events")
    .delete()
    .eq("id", eventId)
    .eq("case_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
