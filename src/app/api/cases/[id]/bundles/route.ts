import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,output_path,storage_path,storage_bucket,error,created_at,updated_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (error) return badRequest(error.message);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim() || "Exhibit Packet";
  const kind = String(body?.kind ?? "exhibits").trim() || "exhibits";
  const include_bates = Boolean(body?.include_bates ?? false);
  const bates_prefix = include_bates ? (body?.bates_prefix ?? null) : null;
  const bates_start = include_bates && body?.bates_start != null ? Number(body.bates_start) : null;
  const exhibit_ids: string[] = Array.isArray(body?.exhibit_ids) ? body.exhibit_ids : [];
  if (!exhibit_ids.length) return badRequest("exhibit_ids[] required");

  const manifest = { exhibit_ids };

  const { data: bundle, error } = await supabase
    .from("case_bundles")
    .insert({ case_id: id, created_by: user.id, title, status: "queued", kind, include_bates, bates_prefix, bates_start, manifest })
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,output_path,storage_path,storage_bucket,error,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);

  const itemsPayload = exhibit_ids.map((exhibit_id, i) => ({ bundle_id: bundle.id, exhibit_id, sort_order: i + 1 }));
  const { error: itemsErr } = await supabase.from("case_bundle_items").insert(itemsPayload);
  if (itemsErr) return badRequest(itemsErr.message);

  return NextResponse.json({ item: bundle });
}
