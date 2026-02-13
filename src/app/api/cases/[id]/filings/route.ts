import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { FilingRepoStub } from "@/lib/filings/repo.stub";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await ctx.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const filings = FilingRepoStub.list(caseId);
  return NextResponse.json({ filings });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await ctx.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const body = await req.json().catch(() => null);

  if (!body?.title || typeof body.title !== "string") {
    return badRequest("Missing title");
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
