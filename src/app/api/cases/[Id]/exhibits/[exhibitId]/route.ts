import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request, props: { params: Promise<{ exhibitId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const patch: any = {};
  if (body.title != null) patch.title = String(body.title);
  if (body.description !== undefined) patch.description = body.description == null ? null : String(body.description);
  if (body.file_id !== undefined) patch.file_id = body.file_id ? String(body.file_id) : null;
  if (body.sort != null) patch.sort = Number(body.sort);

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(patch)
    .eq("id", params.exhibitId)
    .select("id,case_id,file_id,code,title,description,sort,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, props: { params: Promise<{ exhibitId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("case_exhibits").delete().eq("id", params.exhibitId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
