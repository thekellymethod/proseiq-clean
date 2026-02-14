import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function GET(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const tierId = new URL(req.url).searchParams.get("tier_id");
  const supabase = createAdminClient();
  let query = supabase
    .from("academy_modules")
    .select("*, academy_tiers(slug, title)")
    .order("sort_order", { ascending: true });

  if (tierId) query = query.eq("tier_id", tierId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => ({}));
  const tierId = body?.tier_id;
  const slug = String(body?.slug ?? "").trim();
  const title = String(body?.title ?? "").trim();
  if (!tierId || !slug || !title) {
    return NextResponse.json(
      { error: "tier_id, slug, and title required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_modules")
    .insert({
      tier_id: tierId,
      slug,
      title,
      outcome: body?.outcome ?? null,
      sort_order: Number(body?.sort_order) ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
