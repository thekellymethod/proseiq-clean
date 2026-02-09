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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,output_path,error,created_at,updated_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (error) return bad(error.message, 400);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim() || "Exhibit Packet";
  const kind = String(body?.kind ?? "exhibits").trim() || "exhibits";
  const include_bates = Boolean(body?.include_bates ?? false);
  const bates_prefix = include_bates ? (body?.bates_prefix ?? null) : null;
  const bates_start = include_bates && body?.bates_start != null ? Number(body.bates_start) : null;
  const exhibit_ids: string[] = Array.isArray(body?.exhibit_ids) ? body.exhibit_ids : [];
  if (!exhibit_ids.length) return bad("exhibit_ids[] required", 400);

  const manifest = { exhibit_ids };

  const { data: bundle, error } = await supabase
    .from("case_bundles")
    .insert({ case_id: id, created_by: user.id, title, status: "queued", kind, include_bates, bates_prefix, bates_start, manifest })
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,output_path,error,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);

  const itemsPayload = exhibit_ids.map((exhibit_id, i) => ({ bundle_id: bundle.id, exhibit_id, sort_order: i + 1 }));
  const { error: itemsErr } = await supabase.from("case_bundle_items").insert(itemsPayload);
  if (itemsErr) return bad(itemsErr.message, 400);

  return NextResponse.json({ item: bundle });
}
