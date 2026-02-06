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

export async function GET(req: Request) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const status = (url.searchParams.get("status") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);

  let query = supabase
    .from("cases")
    .select("id,title,status,case_type,priority,created_at,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error, count } = await query;
  if (error) return bad(error.message, 400);

  return NextResponse.json({ items: data ?? [], count: count ?? (data?.length ?? 0) });
}

export async function POST(req: Request) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return bad("title required", 400);

  const payload: any = {
    title,
    status: body?.status ?? "active",
    case_type: body?.case_type ?? null,
    priority: body?.priority ?? "normal",
    user_id: body?.user_id ?? null,
  };

  const { data, error } = await supabase
    .from("cases")
    .insert(payload)
    .select("id,title,status,case_type,priority,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}
