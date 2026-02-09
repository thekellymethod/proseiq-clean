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

async function getIntake(supabase: any, caseId: string) {
  const { data, error } = await supabase
    .from("case_intake")
    .select("case_id,data,updated_at,created_at")
    .eq("case_id", caseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  try {
    const item = await getIntake(supabase, id);
    return NextResponse.json({ item: item?.data ?? {} });
  } catch (e: any) {
    return NextResponse.json({ item: {}, warning: e?.message ?? "intake not ready" });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch = body?.patch ?? null;
  if (!patch || typeof patch !== "object") return bad("patch object required", 400);

  try {
    const current = await getIntake(supabase, id);
    const nextData = { ...(current?.data ?? {}), ...patch };

    const { data, error } = await supabase
      .from("case_intake")
      .upsert({ case_id: id, data: nextData }, { onConflict: "case_id" })
      .select("case_id,data,updated_at")
      .single();

    if (error) return bad(error.message, 400);
    return NextResponse.json({ item: data?.data ?? nextData });
  } catch (e: any) {
    return bad(e?.message ?? "Failed to update intake", 400);
  }
}
