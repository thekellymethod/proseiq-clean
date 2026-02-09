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

const MOTION_KIND = "motion";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 1000);

  const { data, error } = await supabase
    .from("case_tasks")
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .eq("case_id", id)
    .eq("kind", MOTION_KIND)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return bad(error.message, 400);

  const items = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.title,
    purpose: r.notes ?? "—",
    status: r.status ?? "idea",
    updated_at: r.updated_at,
    created_at: r.created_at,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? body?.title ?? "").trim();
  if (!name) return bad("name required", 400);

  const status = String(body?.status ?? "idea").trim() || "idea";
  const purpose = String(body?.purpose ?? "").trim();

  const payload: any = {
    case_id: id,
    created_by: user.id,
    kind: MOTION_KIND,
    title: name,
    status,
    notes: purpose || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("case_tasks")
    .insert(payload)
    .select("id,title,notes,status,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);

  return NextResponse.json({
    item: {
      id: data.id,
      name: data.title,
      purpose: data.notes ?? "—",
      status: data.status ?? status,
      updated_at: data.updated_at,
      created_at: data.created_at,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const motionId = String(body?.motion_id ?? body?.id ?? "").trim();
  const incoming = body?.patch && typeof body.patch === "object" ? body.patch : body;
  if (!motionId) return bad("motion_id required", 400);

  const patch: any = {};
  if ("name" in incoming || "title" in incoming) patch.title = String((incoming as any).name ?? (incoming as any).title ?? "").trim();
  if ("purpose" in incoming || "notes" in incoming) patch.notes = String((incoming as any).purpose ?? (incoming as any).notes ?? "").trim() || null;
  if ("status" in incoming) patch.status = String((incoming as any).status ?? "").trim();
  patch.updated_at = new Date().toISOString();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  const { data, error } = await supabase
    .from("case_tasks")
    .update(patch)
    .eq("case_id", id)
    .eq("kind", MOTION_KIND)
    .eq("id", motionId)
    .select("id,title,notes,status,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);

  return NextResponse.json({
    item: {
      id: data.id,
      name: data.title,
      purpose: data.notes ?? "—",
      status: data.status,
      updated_at: data.updated_at,
      created_at: data.created_at,
    },
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const motionId = String(url.searchParams.get("motion_id") ?? "").trim();
  if (!motionId) return bad("motion_id required", 400);

  const { error } = await supabase
    .from("case_tasks")
    .delete()
    .eq("case_id", id)
    .eq("kind", MOTION_KIND)
    .eq("id", motionId);

  if (error) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}

