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

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, res } = await requireUser();
  if (res || !user) return res ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await ctx.params;
  const ok = await verifyCaseAccess(caseId, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filings = FilingRepoStub.list(caseId);
  return NextResponse.json({ filings });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, res } = await requireUser();
  if (res || !user) return res ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await ctx.params;
  const ok = await verifyCaseAccess(caseId, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const filing = FilingRepoStub.create(caseId, {
    title: body.title,
    court: body.court ?? null,
    status: body.status ?? "draft",
    filed_on: body.filed_on ?? null,
    notes: body.notes ?? null,
    document_id: body.document_id ?? null,
    file_url: body.file_url ?? null,
  });

  return NextResponse.json({ filing }, { status: 201 });
}
