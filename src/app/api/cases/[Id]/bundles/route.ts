import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,created_at,updated_at,title,status,kind,include_bates,bates_prefix,bates_start,manifest,output_path,error")
    .eq("case_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const title = String(body?.title ?? "Exhibit Packet").trim() || "Exhibit Packet";
  const kind = body?.kind ?? "exhibits";
  const include_bates = !!body?.include_bates;
  const bates_prefix = body?.bates_prefix ?? null;
  const bates_start = body?.bates_start ?? null;
  const exhibit_ids: string[] = Array.isArray(body?.exhibit_ids) ? body.exhibit_ids : [];

  if (!exhibit_ids.length) {
    return NextResponse.json({ error: "exhibit_ids required" }, { status: 400 });
  }

  // Create bundle record
  const manifest = {
    case_id: params.id,
    created_at: new Date().toISOString(),
    exhibits: exhibit_ids,
  };

  const { data: bundle, error: bundleErr } = await supabase
    .from("case_bundles")
    .insert({
      case_id: params.id,
      title,
      kind,
      include_bates,
      bates_prefix,
      bates_start,
      manifest,
      status: "queued",
    })
    .select("id,case_id,created_at,updated_at,title,status,kind,include_bates,bates_prefix,bates_start,manifest,output_path,error")
    .single();

  if (bundleErr) return NextResponse.json({ error: bundleErr.message }, { status: 400 });

  // Insert bundle items
  const itemRows = exhibit_ids.map((eid, idx) => ({
    bundle_id: bundle.id,
    exhibit_id: eid,
    sort_order: idx + 1,
  }));

  const { error: itemsErr } = await supabase.from("case_bundle_items").insert(itemRows);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

  return NextResponse.json({ item: bundle });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bundle_id, patch } = body ?? {};
  if (!bundle_id) return NextResponse.json({ error: "bundle_id required" }, { status: 400 });

  const safePatch = { ...(patch ?? {}) } as any;
  delete safePatch.case_id;
  delete safePatch.created_by;
  delete safePatch.created_at;

  const { data, error } = await supabase
    .from("case_bundles")
    .update(safePatch)
    .eq("id", bundle_id)
    .eq("case_id", params.id)
    .select("id,case_id,created_at,updated_at,title,status,kind,include_bates,bates_prefix,bates_start,manifest,output_path,error")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}