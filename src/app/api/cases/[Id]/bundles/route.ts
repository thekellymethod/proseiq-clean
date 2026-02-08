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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,manifest,storage_bucket,storage_path,created_at,updated_at")
    .eq("case_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return bad(error.message, 400);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim() || "Bundle";

  const manifest = body?.manifest ?? { include: body?.include ?? ["exhibits", "documents", "drafts"] };

  const { data: bundle, error } = await supabase
    .from("case_bundles")
    .insert({ case_id: params.id, title, status: "queued", manifest })
    .select("id,case_id,title,status,manifest,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  if (bundle?.id) {
    const origin = new URL(req.url).origin;
    try {
      await fetch(`${origin}/api/workers/bundles/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ bundleId: bundle.id }),
      });
    } catch {
      // Best-effort enqueue; worker will be retried by user if needed.
    }
  }
  return NextResponse.json({ item: bundle });
}
