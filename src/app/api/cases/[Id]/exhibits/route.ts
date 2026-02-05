
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_exhibits")
    .select("id,case_id,file_id,code,title,description,sort,page_count,bates_start,bates_end,created_at")
    .eq("case_id", params.id)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const code = normalizeCode(String(body.code ?? ""));
  if (!code) return NextResponse.json({ error: "code required (e.g., C-001)" }, { status: 400 });

  const title = String(body.title ?? "").trim();
  const description = body.description == null ? null : String(body.description);
  const file_id = body.file_id ? String(body.file_id) : null;
  const sort = body.sort != null ? Number(body.sort) : 0;

  const { data, error } = await supabase
    .from("case_exhibits")
    .insert({
      case_id: params.id,
      code,
      title,
      description,
      file_id,
      sort,
    })
    .select("id,case_id,file_id,code,title,description,sort,page_count,bates_start,bates_end,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "exhibit",
    entity_id: data.id,
    action: "create",
    metadata: { case_id: params.id, code },
  });

  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // PATCH expects ?exhibitId=
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exhibitId = url.searchParams.get("exhibitId");
  if (!exhibitId) return NextResponse.json({ error: "exhibitId required" }, { status: 400 });

  const body = await req.json();
  const patch: any = {};
  if (body.code != null) patch.code = normalizeCode(String(body.code));
  if (body.title != null) patch.title = String(body.title);
  if (body.description !== undefined) patch.description = body.description == null ? null : String(body.description);
  if (body.file_id !== undefined) patch.file_id = body.file_id == null ? null : String(body.file_id);
  if (body.sort != null) patch.sort = Number(body.sort);

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(patch)
    .eq("id", exhibitId)
    .eq("case_id", params.id)
    .select("id,case_id,file_id,code,title,description,sort,page_count,bates_start,bates_end,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "exhibit",
    entity_id: data.id,
    action: "update",
    metadata: patch,
  });

  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // DELETE expects ?exhibitId=
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exhibitId = url.searchParams.get("exhibitId");
  if (!exhibitId) return NextResponse.json({ error: "exhibitId required" }, { status: 400 });

  const { error } = await supabase.from("case_exhibits").delete().eq("id", exhibitId).eq("case_id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "exhibit",
    entity_id: exhibitId,
    action: "delete",
    metadata: { case_id: params.id },
  });

  return NextResponse.json({ ok: true });
}
