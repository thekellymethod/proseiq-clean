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

export async function GET(_: Request, { params }: { params: { id: string; docId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { data, error } = await supabase
    .from("case_documents")
    .select("id,case_id,filename,mime_type,byte_size,storage_bucket,storage_path,status,notes,tags,created_at,updated_at")
    .eq("case_id", params.id)
    .eq("id", params.docId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!data) return bad("Not found", 404);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string; docId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of ["filename", "notes", "tags", "status"]) if (k in body) patch[k] = body[k];
  if ("filename" in patch) patch.filename = String(patch.filename ?? "").trim();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  const { data, error } = await supabase
    .from("case_documents")
    .update(patch)
    .eq("case_id", params.id)
    .eq("id", params.docId)
    .select("id,case_id,filename,mime_type,byte_size,storage_bucket,storage_path,status,notes,tags,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: { id: string; docId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { data: doc, error: readErr } = await supabase
    .from("case_documents")
    .select("id,storage_bucket,storage_path")
    .eq("case_id", params.id)
    .eq("id", params.docId)
    .maybeSingle();

  if (readErr) return bad(readErr.message, 400);
  if (!doc) return bad("Not found", 404);

  if (doc.storage_bucket && doc.storage_path) {
    await supabase.storage.from(doc.storage_bucket).remove([doc.storage_path]);
  }

  const { error } = await supabase.from("case_documents").delete().eq("case_id", params.id).eq("id", params.docId);
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}
