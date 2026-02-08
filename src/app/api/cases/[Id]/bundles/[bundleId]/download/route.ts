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

export async function GET(req: Request, { params }: { params: { id: string; bundleId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { data: bundle, error } = await supabase
    .from("case_bundles")
    .select("id,status,storage_bucket,storage_path,title")
    .eq("case_id", params.id)
    .eq("id", params.bundleId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!bundle) return bad("Not found", 404);

  if (bundle.status !== "ready" || !bundle.storage_bucket || !bundle.storage_path) {
    return bad("Bundle not ready. Process it first.", 409);
  }

  const { data: blob, error: dlErr } = await supabase.storage.from(bundle.storage_bucket).download(bundle.storage_path);
  if (dlErr) return bad(dlErr.message, 400);
  if (!blob) return bad("Bundle not found", 404);

  const bytes = Buffer.from(await blob.arrayBuffer());
  const filename = `${bundle.title || bundle.id}.zip`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Content-Length": String(bytes.length),
    },
  });
}
