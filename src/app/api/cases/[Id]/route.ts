import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const status = String(body.status ?? "").trim();
  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });

  const { data, error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", params.id)
    .select("id,title,status,created_at,created_by,updated_at,user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
