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

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const body = await req.json().catch(() => ({}));

  const filenameRaw = String(body?.filename ?? "").trim();
  const mimeType = String(body?.mime_type ?? body?.mimeType ?? "").trim() || "image/png";
  if (!filenameRaw) return bad("filename required", 400);

  // Ensure draft exists and belongs to this case (and RLS applies to created_by).
  const { data: draft, error: dErr } = await supabase
    .from("case_drafts")
    .select("id")
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();
  if (dErr) return bad(dErr.message, 400);
  if (!draft) return bad("Not found", 404);

  const bucket = String(body?.bucket ?? "case-signatures");
  const filename = safeName(filenameRaw);
  const objectPath = `${user.id}/${id}/signatures/${draftId}/${crypto.randomUUID()}-${filename}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return bad(error.message, 400);

  return NextResponse.json({
    upload: {
      bucket,
      path: objectPath,
      signedUrl: data?.signedUrl,
      token: data?.token,
      headers: { "Content-Type": mimeType },
    },
  });
}

