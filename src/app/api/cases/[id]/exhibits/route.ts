import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

function mapEx(row: any) {
  return {
    id: row.id,
    case_id: row.case_id,
    sequence: row.exhibit_no,
    label: row.label,
    title: row.title,
    description: row.description ?? null,
    proof_notes: row.proof_notes ?? null,
    source: row.source ?? null,
    file_path: row.file_path ?? null,
    url: row.url ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase
    .from("case_exhibits")
    .select("id,case_id,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order,created_at,updated_at")
    .eq("case_id", id)
    .order("sort_order", { ascending: true })
    .order("exhibit_no", { ascending: true });

  if (error) return badRequest(error.message);
  return NextResponse.json({ items: (data ?? []).map(mapEx) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return badRequest("title required");

  const { data: last } = await supabase
    .from("case_exhibits")
    .select("exhibit_no")
    .eq("case_id", id)
    .order("exhibit_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextNo = (Number(last?.exhibit_no ?? 0) || 0) + 1;

  const payload: any = {
    case_id: id,
    created_by: user.id,
    code: String(body?.code ?? `EX-${String(nextNo).padStart(3, "0")}`),
    title,
    description: body?.description ?? null,
    proof_notes: body?.proof_notes ?? null,
    source: body?.source ?? null,
    url: body?.url ?? null,
    exhibit_no: body?.sequence != null ? Number(body.sequence) : nextNo,
    label: body?.label ?? `Exhibit ${nextNo}`,
    sort_order: body?.sort_order != null ? Number(body.sort_order) : nextNo,
  };

  const { data, error } = await supabase
    .from("case_exhibits")
    .insert(payload)
    .select("id,case_id,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: mapEx(data) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const exhibitId = String(body?.exhibit_id ?? body?.id ?? "").trim();
  if (!exhibitId) return badRequest("exhibit_id required");

  const incoming = body?.patch && typeof body.patch === "object" ? body.patch : body;
  const patch: any = {};
  for (const k of ["title", "description", "proof_notes", "source", "url", "label", "sort_order", "sequence"]) {
    if (k in incoming) patch[k] = (incoming as any)[k];
  }
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();
  if ("sequence" in patch) {
    patch.exhibit_no = Number(patch.sequence);
    delete patch.sequence;
  }

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(patch)
    .eq("case_id", id)
    .eq("id", exhibitId)
    .select("id,case_id,exhibit_no,label,title,description,proof_notes,source,file_path,url,sort_order,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: mapEx(data) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const exhibitId = url.searchParams.get("exhibit_id");
  if (!exhibitId) return badRequest("exhibit_id required");

  const { error } = await supabase.from("case_exhibits").delete().eq("case_id", id).eq("id", exhibitId);
  if (error) return badRequest(error.message);

  return NextResponse.json({ ok: true });
}
