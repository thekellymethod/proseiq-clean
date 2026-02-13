import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase
    .from("case_parties")
    .select("id,case_id,role,name,notes,created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/cases/[id]/parties failed", { message: error.message, code: (error as any).code, details: (error as any).details });
    return badRequest(error.message);
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const role = String(body?.role ?? "other");
  const name = String(body?.name ?? "").trim();
  if (!name) return badRequest("name required");

  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const address = String(body?.address ?? "").trim();
  const notesRaw = body?.notes != null ? String(body.notes) : "";
  const notesParts = [
    email ? `email: ${email}` : null,
    phone ? `phone: ${phone}` : null,
    address ? `address: ${address}` : null,
    notesRaw.trim() ? `notes: ${notesRaw.trim()}` : null,
  ].filter(Boolean) as string[];

  const payload: any = {
    case_id: id,
    role,
    name,
    created_by: user.id,
    notes: notesParts.length ? notesParts.join("\n") : null,
  };

  const { data, error } = await supabase
    .from("case_parties")
    .insert(payload)
    .select("id,case_id,role,name,notes,created_at")
    .single();

    if (error) {
      console.error("POST /api/cases/[id]/parties failed", { message: error.message, code: (error as any).code, details: (error as any).details });
      return badRequest(error.message);
    }
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const partyId = url.searchParams.get("party_id");
  if (!partyId) return badRequest("party_id required");

  const { error } = await supabase.from("case_parties").delete().eq("case_id", id).eq("id", partyId);
  if (error) {
    console.error("DELETE /api/cases/[id]/parties failed", { message: error.message, code: (error as any).code, details: (error as any).details });
    return badRequest(error.message);
  }

  return NextResponse.json({ ok: true });
}
