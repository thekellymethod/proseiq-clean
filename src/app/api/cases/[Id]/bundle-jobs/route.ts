
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("bundle_jobs")
    .select("id,case_id,draft_id,status,error,options,output_bucket,output_path,output_bytes,created_at,updated_at")
    .eq("case_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const draftId = body.draftId ? String(body.draftId) : null;

  const options = {
    bates: {
      prefix: String(body?.bates?.prefix ?? "PROSEIQ"),
      start: Number(body?.bates?.start ?? 1),
      width: Number(body?.bates?.width ?? 6),
      mode: String(body?.bates?.mode ?? "tierA"),
    },
    includeOriginals: body.includeOriginals !== false,
    includeDraftPdf: !!draftId,
  };

  const { data, error } = await supabase
    .from("bundle_jobs")
    .insert({
      case_id: params.id,
      draft_id: draftId,
      status: "queued",
      options,
    })
    .select("id,case_id,draft_id,status,options,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "bundle",
    entity_id: data.id,
    action: "queue",
    metadata: { case_id: params.id, options },
  });

  return NextResponse.json({ item: data });
}
