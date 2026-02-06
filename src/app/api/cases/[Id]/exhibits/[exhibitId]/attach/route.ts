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

export async function POST(req: Request, { params }: { params: { id: string; exhibitId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const docId = String(body?.docId ?? body?.document_id ?? "").trim();
  if (!docId) return bad("docId required", 400);

  const { data: ex, error: exErr } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", params.id)
    .eq("id", params.exhibitId)
    .maybeSingle();
  if (exErr) return bad(exErr.message, 400);
  if (!ex) return bad("Exhibit not found", 404);

  const { data: doc, error: docErr } = await supabase
    .from("case_documents")
    .select("id")
    .eq("case_id", params.id)
    .eq("id", docId)
    .maybeSingle();
  if (docErr) return bad(docErr.message, 400);
  if (!doc) return bad("Document not found", 404);

  const { error } = await supabase
    .from("case_exhibit_documents")
    .insert({ exhibit_id: params.exhibitId, document_id: docId });

  if (error && !/duplicate/i.test(error.message)) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string; exhibitId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const url = new URL(req.url);
  const docId = url.searchParams.get("docId") ?? url.searchParams.get("document_id");
  if (!docId) return bad("docId required", 400);

  const { error } = await supabase
    .from("case_exhibit_documents")
    .delete()
    .eq("exhibit_id", params.exhibitId)
    .eq("document_id", docId);

  if (error) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}
