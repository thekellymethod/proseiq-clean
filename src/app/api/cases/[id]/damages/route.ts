import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDamages } from "@/lib/damages/calc";

async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user: auth.user, res: null as NextResponse | null };
}

async function verifyCaseAccess(caseId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("created_by", userId)
    .maybeSingle();
  return !!data;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, res } = await requireUser();
  if (res) return res;

  const { id: caseId } = await ctx.params;
  const ok = await verifyCaseAccess(caseId, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body?.line_items || !Array.isArray(body.line_items)) {
    return NextResponse.json({ error: "line_items array required" }, { status: 400 });
  }

  const result = calculateDamages(body);
  return NextResponse.json(result);
}
