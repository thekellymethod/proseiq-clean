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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const order: string[] = Array.isArray(body?.order) ? body.order : [];
  if (!order.length) return bad("order[] required", 400);

  const results = await Promise.all(
    order.map((exhibitId, i) =>
      supabase
        .from("case_exhibits")
        .update({ exhibit_index: i + 1, exhibit_label: `Exhibit ${i + 1}` })
        .eq("case_id", params.id)
        .eq("id", exhibitId)
    )
  );

  const firstErr = results.map((r: any) => r.error).find(Boolean);
  if (firstErr) return bad(firstErr.message, 400);

  return NextResponse.json({ ok: true });
}
