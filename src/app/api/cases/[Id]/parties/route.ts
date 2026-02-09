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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const { data, error } = await supabase
    .from("case_parties")
    .select("id,case_id,role,name,notes,created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/cases/[id]/parties failed", { message: error.message, code: (error as any).code, details: (error as any).details });
    return bad(error.message, 400);
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const role = String(body?.role ?? "other");
  const name = String(body?.name ?? "").trim();
  if (!name) return bad("name required", 400);

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
    return bad(error.message, 400);
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const partyId = url.searchParams.get("party_id");
  if (!partyId) return bad("party_id required", 400);

  const { error } = await supabase.from("case_parties").delete().eq("case_id", id).eq("id", partyId);
  if (error) {
    console.error("DELETE /api/cases/[id]/parties failed", { message: error.message, code: (error as any).code, details: (error as any).details });
    return bad(error.message, 400);
  }

  return NextResponse.json({ ok: true });
}
