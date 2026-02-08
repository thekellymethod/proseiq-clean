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

export async function GET(_: Request, { params }: { params: { id: string; draftId: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { data: draft, error } = await supabase
    .from("case_drafts")
    .select("id,title,content_md,updated_at")
    .eq("case_id", params.id)
    .eq("id", params.draftId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!draft) return bad("Not found", 404);

  const title = String(draft.title ?? "Draft");
  const text = mdToPlain(draft.content_md ?? "");
  const bytes = buildDocx({ title, body: text });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${draft.id}.docx"`,
    },
  });
}
