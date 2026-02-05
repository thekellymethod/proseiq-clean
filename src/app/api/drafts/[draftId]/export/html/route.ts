import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(_: Request, props: { params: Promise<{ draftId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: d, error } = await supabase
    .from("case_drafts")
    .select("id,case_id,title,kind,content,created_at,updated_at")
    .eq("id", params.draftId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const title = escapeHtml(d.title || "Draft");
  const kind = escapeHtml(d.kind || "narrative");
  const updated = new Date(d.updated_at).toLocaleString();
  const body = escapeHtml(d.content || "");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 40px; }
    .meta { color: #555; font-size: 12px; margin-bottom: 20px; }
    h1 { font-size: 20px; margin: 0 0 8px 0; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.5; }
    @media print { body { margin: 0.75in; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Kind: ${kind} • Updated: ${updated}</div>
  <pre>${body}</pre>
</body>
</html>`;

  const filenameSafe = (d.title || "draft").replace(/[^\w.\- ()]/g, "_").slice(0, 80);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameSafe}.html"`,
      "Cache-Control": "no-store",
    },
  });
}
