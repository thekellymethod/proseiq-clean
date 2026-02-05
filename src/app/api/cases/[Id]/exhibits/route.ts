import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_exhibits")
    .select("id,case_id,created_at,updated_at,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order")
    .eq("case_id", params.id)
    .order("sort_order", { ascending: true })
    .order("exhibit_no", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  // determine next exhibit_no
  const { data: maxRow, error: maxErr } = await supabase
    .from("case_exhibits")
    .select("exhibit_no")
    .eq("case_id", params.id)
    .order("exhibit_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxErr) return NextResponse.json({ error: maxErr.message }, { status: 400 });
  const nextNo = (maxRow?.exhibit_no ?? 0) + 1;
  const label = `C-${pad3(nextNo)}`;

  const { data, error } = await supabase
    .from("case_exhibits")
    .insert({
      case_id: params.id,
      exhibit_no: nextNo,
      label,
      title,
      description: body?.description ?? null,
      proof_notes: body?.proof_notes ?? null,
      source: body?.source ?? null,
      url: body?.url ?? null,
      file_path: body?.file_path ?? null,
      sort_order: body?.sort_order ?? nextNo,
    })
    .select("id,case_id,created_at,updated_at,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { exhibit_id, patch } = body ?? {};
  if (!exhibit_id) return NextResponse.json({ error: "exhibit_id required" }, { status: 400 });

  // Do not allow changing exhibit_no or label from client
  const safePatch = { ...(patch ?? {}) } as any;
  delete safePatch.exhibit_no;
  delete safePatch.label;
  delete safePatch.case_id;
  delete safePatch.created_by;
  delete safePatch.created_at;

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(safePatch)
    .eq("id", exhibit_id)
    .eq("case_id", params.id)
    .select("id,case_id,created_at,updated_at,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exhibitId = url.searchParams.get("exhibit_id");
  if (!exhibitId) return NextResponse.json({ error: "exhibit_id required" }, { status: 400 });

  const { error } = await supabase
    .from("case_exhibits")
    .delete()
    .eq("id", exhibitId)
    .eq("case_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}