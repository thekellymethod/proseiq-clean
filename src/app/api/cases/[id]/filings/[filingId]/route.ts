import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FilingRepoStub } from "@/lib/filings/repo.stub";

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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; filingId: string }> }) {
  const { user, res } = await requireUser();
  if (res) return res;

  const { id: caseId, filingId } = await ctx.params;
  const ok = await verifyCaseAccess(caseId, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = FilingRepoStub.update(caseId, filingId, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ filing: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string; filingId: string }> }) {
  const { user, res } = await requireUser();
  if (res) return res;

  const { id: caseId, filingId } = await ctx.params;
  const ok = await verifyCaseAccess(caseId, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const removed = FilingRepoStub.remove(caseId, filingId);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
