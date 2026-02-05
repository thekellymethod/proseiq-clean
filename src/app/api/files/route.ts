//src/app/api/files/[fileId]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request, props: { params: Promise<{ fileId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const patch: any = {};
  if (body.filename != null) patch.filename = String(body.filename);
  if (body.status != null) patch.status = String(body.status);
  if (body.notes !== undefined) patch.notes = body.notes == null ? null : String(body.notes);
  if (body.tags != null) patch.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];

  const { data, error } = await supabase
    .from("case_files")
    .update(patch)
    .eq("id", params.fileId)
    .select("id,case_id,filename,mime,size,bucket,path,status,tags,notes,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "file",
    entity_id: data.id,
    action: "update",
    metadata: patch,
  });

  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, props: { params: Promise<{ fileId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: f, error: fErr } = await supabase
    .from("case_files")
    .select("id,bucket,path")
    .eq("id", params.fileId)
    .single();

  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 });

  // delete from storage first
  const rm = await supabase.storage.from(f.bucket).remove([f.path]);
  if (rm.error) return NextResponse.json({ error: rm.error.message }, { status: 400 });

  const { error } = await supabase.from("case_files").delete().eq("id", params.fileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "file",
    entity_id: f.id,
    action: "delete",
    metadata: { path: f.path },
  });

  return NextResponse.json({ ok: true });
}
