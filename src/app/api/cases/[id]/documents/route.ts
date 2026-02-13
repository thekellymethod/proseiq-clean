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

function mapDoc(row: any) {
  return {
    id: row.id,
    case_id: row.case_id,
    filename: row.filename,
    mime_type: row.mime_type ?? null,
    byte_size: row.size_bytes ?? null,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    kind: row.kind ?? null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 1000);

  // Verify case ownership
  const { data: c } = await supabase.from("cases").select("id").eq("id", id).eq("created_by", user.id).maybeSingle();
  if (!c) return bad("Not found", 404);

  const { data, error } = await supabase
    .from("documents")
    .select("id,case_id,filename,mime_type,size_bytes,storage_bucket,storage_path,kind,status,created_at,updated_at")
    .eq("case_id", id)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return bad(error.message, 400);
  return NextResponse.json({ items: (data ?? []).map(mapDoc) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const filename = String(body?.filename ?? "").trim();
  if (!filename) return bad("filename required", 400);

  const payload: any = {
    case_id: id,
    created_by: user.id,
    filename,
    mime_type: body?.mime_type ?? null,
    size_bytes: body?.byte_size ?? body?.size_bytes ?? null,
    storage_bucket: body?.storage_bucket ?? "case-documents",
    storage_path: body?.storage_path ?? null,
    kind: body?.kind ?? "general",
    status: body?.status ?? "active",
  };

  const { data, error } = await supabase
    .from("documents")
    .insert(payload)
    .select("id,case_id,filename,mime_type,size_bytes,storage_bucket,storage_path,kind,status,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: mapDoc(data) });
}
