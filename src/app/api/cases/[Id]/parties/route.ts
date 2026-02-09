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
    .select("id,case_id,role,name,email,phone,address,notes,created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (error) return bad(error.message, 400);
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

  const payload: any = {
    case_id: id,
    role,
    name,
    email: body?.email ?? null,
    phone: body?.phone ?? null,
    address: body?.address ?? null,
    notes: body?.notes ?? null,
  };

  const { data, error } = await supabase
    .from("case_parties")
    .insert(payload)
    .select("id,case_id,role,name,email,phone,address,notes,created_at")
    .single();

  if (error) return bad(error.message, 400);
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
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}
