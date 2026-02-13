import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { FilingRepoStub } from "@/lib/filings/repo.stub";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; filingId: string }> }) {
  const { id: caseId, filingId } = await ctx.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid body");
  }

  const updated = FilingRepoStub.update(caseId, filingId, body);
  if (!updated) return notFound("Filing not found");

  return NextResponse.json({ filing: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string; filingId: string }> }) {
  const { id: caseId, filingId } = await ctx.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const removed = FilingRepoStub.remove(caseId, filingId);
  if (!removed) return notFound("Filing not found");

  return NextResponse.json({ ok: true });
}
