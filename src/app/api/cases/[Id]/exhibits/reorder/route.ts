
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const order: Array<{ id: string; sort: number }> = Array.isArray(body.order) ? body.order : [];
  if (!order.length) return NextResponse.json({ error: "order required" }, { status: 400 });

  for (const o of order) {
    await supabase
      .from("case_exhibits")
      .update({ sort: Number(o.sort) })
      .eq("id", o.id)
      .eq("case_id", params.id);
  }

  await supabase.from("audit_log").insert({
    entity: "exhibit",
    entity_id: null,
    action: "reorder",
    metadata: { case_id: params.id, count: order.length },
  });

  return NextResponse.json({ ok: true });
}
