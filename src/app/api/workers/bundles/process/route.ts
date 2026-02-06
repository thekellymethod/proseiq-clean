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

async function mdToPlain(md: string) {
  return String(md ?? "")
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

export async function POST(req: Request) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const bundleId = String(body?.bundleId ?? "").trim();
  if (!bundleId) return bad("bundleId required", 400);

  const { data: bundle, error: bErr } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,manifest")
    .eq("id", bundleId)
    .maybeSingle();
  if (bErr) return bad(bErr.message, 400);
  if (!bundle) return bad("Bundle not found", 404);

  // Mark processing
  await supabase.from("case_bundles").update({ status: "processing" }).eq("id", bundleId);

  let JSZip: any;
  try {
    JSZip = (await import("jszip")).default;
  } catch {
    await supabase.from("case_bundles").update({ status: "error" }).eq("id", bundleId);
    return bad("Missing dependency: jszip", 500);
  }

  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(bundle.manifest ?? {}, null, 2));

  const include: string[] = Array.isArray(bundle.manifest?.include) ? bundle.manifest.include : ["documents", "exhibits", "drafts"];

  // Documents
  if (include.includes("documents")) {
    const { data: docs } = await supabase
      .from("case_documents")
      .select("id,filename,storage_bucket,storage_path,status")
      .eq("case_id", bundle.case_id)
      .order("created_at", { ascending: true });

    for (const d of docs ?? []) {
      if (!d.storage_bucket || !d.storage_path) continue;
      const { data: blob } = await supabase.storage.from(d.storage_bucket).download(d.storage_path);
      if (!blob) continue;
      const buf = Buffer.from(await blob.arrayBuffer());
      zip.folder("documents")?.file(d.filename || `${d.id}`, buf);
    }
  }

  // Exhibits list (no stamping here)
  if (include.includes("exhibits")) {
    const { data: exhibits } = await supabase
      .from("case_exhibits")
      .select("id,exhibit_index,exhibit_label,title,description")
      .eq("case_id", bundle.case_id)
      .order("exhibit_index", { ascending: true });

    zip.file("exhibits.json", JSON.stringify(exhibits ?? [], null, 2));
  }

  // Drafts (plain text)
  if (include.includes("drafts")) {
    const { data: drafts } = await supabase
      .from("case_drafts")
      .select("id,title,kind,status,content_md,updated_at")
      .eq("case_id", bundle.case_id)
      .order("updated_at", { ascending: false });

    const folder = zip.folder("drafts");
    for (const dr of drafts ?? []) {
      const text = mdToPlain(dr.content_md ?? "");
      const safe = String(dr.title ?? dr.id).replace(/[^a-zA-Z0-9._-]/g, "_");
      folder?.file(`${safe}.txt`, text);
    }
  }

  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });

  const bucket = "case-files";
  const storagePath = `${user.id}/${bundle.case_id}/bundles/${bundle.id}.zip`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, zipBytes, {
    contentType: "application/zip",
    upsert: true,
  });

  if (upErr) {
    await supabase.from("case_bundles").update({ status: "error" }).eq("id", bundleId);
    return bad(upErr.message, 400);
  }

  await supabase
    .from("case_bundles")
    .update({ status: "ready", storage_bucket: bucket, storage_path: storagePath })
    .eq("id", bundleId);

  return NextResponse.json({ ok: true, storage_bucket: bucket, storage_path: storagePath });
}
