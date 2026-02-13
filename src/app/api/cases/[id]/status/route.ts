import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "").trim();
  if (!status) return badRequest("status required");
  if (!["active", "archived"].includes(status)) return badRequest("status must be active|archived");

  const { data, error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", id)
    .select("id,status,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}
