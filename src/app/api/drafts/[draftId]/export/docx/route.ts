import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildDocx } from "@/lib/docx";

export async function GET(_: Request, { params }: { params: { draftId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: d, error } = await supabase
    .from("case_drafts")
    .select("id,case_id,title,kind,content,created_at,updated_at")
    .eq("id", params.draftId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const meta = `Kind: ${d.kind} | Updated: ${new Date(d.updated_at).toLocaleString()}`;
  const bytes = buildDocx({ title: d.title || "Draft", meta, body: d.content || "" });

  const filenameSafe = (d.title || "draft").replace(/[^\w.\- ()]/g, "_").slice(0, 80);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filenameSafe}.docx"`,
      "Cache-Control": "no-store",
    },
  });
}
