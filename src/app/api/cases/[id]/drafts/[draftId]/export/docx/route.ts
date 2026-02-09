import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildDocx } from "@/lib/docx";

async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user: auth.user, res: null as any };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function mdToPlain(md: string) {
  return String(md ?? "")
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const { data: draft, error } = await supabase
    .from("case_drafts")
    .select("id,title,content,updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title")
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!draft) return bad("Not found", 404);

  const title = String(draft.title ?? "Draft");
  const text = mdToPlain(draft.content ?? "");

  let sig: Uint8Array | null = null;
  if (draft.signature_bucket && draft.signature_path) {
    const { data: blob, error: dlErr } = await supabase.storage.from(draft.signature_bucket).download(draft.signature_path);
    if (!dlErr && blob) {
      const ab = await blob.arrayBuffer();
      sig = new Uint8Array(ab);
    }
  }

  const metaParts: string[] = [];
  if (draft.signature_name) metaParts.push(draft.signature_name);
  if (draft.signature_title) metaParts.push(draft.signature_title);
  const meta = metaParts.length ? metaParts.join(" • ") : "";

  const bytes = buildDocx({ title, meta, body: text, courtStyle: true, signaturePng: sig });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${draft.id}.docx"`,
    },
  });
}
