import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { calculateDamages } from "@/lib/damages/calc";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await ctx.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const body = await req.json().catch(() => null);
  if (!body?.line_items || !Array.isArray(body.line_items)) {
    return badRequest("line_items array required");
  }

  const damagesResult = calculateDamages(body);
  return NextResponse.json(damagesResult);
}
