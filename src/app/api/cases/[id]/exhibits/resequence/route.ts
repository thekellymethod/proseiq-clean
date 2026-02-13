import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const order: string[] = Array.isArray(body?.order) ? body.order : [];
  if (!order.length) return badRequest("order[] required");

  const results = await Promise.all(
    order.map((exhibitId, i) =>
      supabase
        .from("case_exhibits")
        .update({ sort_order: i + 1, exhibit_no: i + 1, label: `Exhibit ${i + 1}` })
        .eq("case_id", id)
        .eq("id", exhibitId)
    )
  );

  const firstErr = results.map((r: any) => r.error).find(Boolean);
  if (firstErr) return badRequest(firstErr.message);

  return NextResponse.json({ ok: true });
}
