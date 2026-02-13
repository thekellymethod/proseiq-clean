import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 2000);

  let query = supabase
    .from("case_drafts")
    .select("id,case_id,title,kind,status,template_id,created_at,updated_at")
    .eq("case_id", id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) return badRequest(error.message);

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return badRequest("title required");

  const payload: any = {
    case_id: id,
    created_by: user.id,
    title,
    kind: body?.kind ?? "draft",
    status: body?.status ?? "draft",
    content: body?.content ?? "",
    content_rich: body?.content_rich ?? null,
    template_id: body?.template_id ?? null,
  };

  const { data, error } = await supabase
    .from("case_drafts")
    .insert(payload)
    .select("id,case_id,title,kind,status,template_id,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}
