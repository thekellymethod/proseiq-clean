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
  const includeDocs = (url.searchParams.get("includeDocs") ?? "").toLowerCase() === "true";

  const { data, error } = await supabase
    .from("case_exhibits")
    .select("id,case_id,exhibit_index,exhibit_label,title,description,kind,created_at,updated_at")
    .eq("case_id", params.id)
    .order("exhibit_index", { ascending: true });

  if (error) return bad(error.message, 400);
  if (!includeDocs) return NextResponse.json({ items: data ?? [] });

  const exhibitIds = (data ?? []).map((x) => x.id);
  if (exhibitIds.length === 0) return NextResponse.json({ items: [] });

  const { data: links } = await supabase
    .from("case_exhibit_documents")
    .select("exhibit_id,document_id")
    .in("exhibit_id", exhibitIds);

  const docIds = Array.from(new Set((links ?? []).map((l: any) => l.document_id).filter(Boolean)));
  let docsById: Record<string, any> = {};
  if (docIds.length) {
    const { data: docs } = await supabase
      .from("case_documents")
      .select("id,filename,mime_type,byte_size,status,created_at,storage_bucket,storage_path")
      .in("id", docIds);
    docsById = Object.fromEntries((docs ?? []).map((d: any) => [d.id, d]));
  }

  const docsByExhibit: Record<string, any[]> = {};
  for (const l of links ?? []) {
    const d = docsById[l.document_id];
    if (!d) continue;
    docsByExhibit[l.exhibit_id] = docsByExhibit[l.exhibit_id] ?? [];
    docsByExhibit[l.exhibit_id].push(d);
  }

  const enriched = (data ?? []).map((e: any) => ({ ...e, documents: docsByExhibit[e.id] ?? [] }));
  return NextResponse.json({ items: enriched });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return bad("title required", 400);

  let exhibit_index: number | null = body?.exhibit_index ?? body?.index ?? null;
  if (!exhibit_index) {
    const { data: last } = await supabase
      .from("case_exhibits")
      .select("exhibit_index")
      .eq("case_id", params.id)
      .order("exhibit_index", { ascending: false })
      .limit(1)
      .maybeSingle();
    exhibit_index = (Number(last?.exhibit_index ?? 0) || 0) + 1;
  }

  const payload: any = {
    case_id: params.id,
    title,
    description: body?.description ?? null,
    kind: body?.kind ?? "document",
    exhibit_index,
    exhibit_label: body?.exhibit_label ?? `Exhibit ${exhibit_index}`,
  };

  const { data, error } = await supabase
    .from("case_exhibits")
    .insert(payload)
    .select("id,case_id,exhibit_index,exhibit_label,title,description,kind,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const exhibitId = String(body?.exhibit_id ?? body?.id ?? "").trim();
  if (!exhibitId) return bad("exhibit_id required", 400);

  const patch: any = {};
  for (const k of ["title", "description", "kind", "exhibit_index", "exhibit_label"]) if (k in body) patch[k] = body[k];
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(patch)
    .eq("case_id", params.id)
    .eq("id", exhibitId)
    .select("id,case_id,exhibit_index,exhibit_label,title,description,kind,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const url = new URL(req.url);
  const exhibitId = url.searchParams.get("exhibit_id");
  if (!exhibitId) return bad("exhibit_id required", 400);

  await supabase.from("case_exhibit_documents").delete().eq("exhibit_id", exhibitId);

  const { error } = await supabase.from("case_exhibits").delete().eq("case_id", params.id).eq("id", exhibitId);
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}
