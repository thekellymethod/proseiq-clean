import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function GET(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const moduleId = new URL(req.url).searchParams.get("module_id");
  if (!moduleId) {
    return NextResponse.json({ error: "module_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_module_content")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => ({}));
  const moduleId = body?.module_id;
  if (!moduleId) {
    return NextResponse.json({ error: "module_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_module_content")
    .insert({
      module_id: moduleId,
      kind: body?.kind ?? "lesson",
      title: body?.title ?? null,
      content: body?.content ?? null,
      content_rich: body?.content_rich ?? null,
      media: Array.isArray(body?.media) ? body.media : [],
      sort_order: Number(body?.sort_order) ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
