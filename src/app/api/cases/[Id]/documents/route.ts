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
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 1000);

  const { data, error } = await supabase
    .from("case_documents")
    .select("id,case_id,filename,mime_type,byte_size,storage_bucket,storage_path,status,notes,tags,created_at,updated_at")
    .eq("case_id", params.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return bad(error.message, 400);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const filename = String(body?.filename ?? "").trim();
  if (!filename) return bad("filename required", 400);

  const payload: any = {
    case_id: params.id,
    filename,
    mime_type: body?.mime_type ?? null,
    byte_size: body?.byte_size ?? null,
    storage_bucket: body?.storage_bucket ?? "case-files",
    storage_path: body?.storage_path ?? null,
    status: body?.status ?? "ready",
    notes: body?.notes ?? null,
    tags: body?.tags ?? null,
  };

  const { data, error } = await supabase
    .from("case_documents")
    .insert(payload)
    .select("id,case_id,filename,mime_type,byte_size,storage_bucket,storage_path,status,notes,tags,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}
