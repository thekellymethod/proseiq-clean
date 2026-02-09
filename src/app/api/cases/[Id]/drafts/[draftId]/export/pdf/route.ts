import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { stampPdfBates } from "@/lib/pdf-stamp";

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const { data: draft, error } = await supabase
    .from("case_drafts")
    .select("id,title,content_md,updated_at")
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!draft) return bad("Not found", 404);

  let pdfLib: any;
  try {
    pdfLib = await import("pdf-lib");
  } catch {
    return bad("Missing dependency: pdf-lib", 500);
  }

  const { PDFDocument, StandardFonts } = pdfLib;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const { width, height } = page.getSize();

  const text = mdToPlain(draft.content_md ?? "");
  const title = String(draft.title ?? "Draft");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSizeTitle = 16;
  const fontSizeBody = 11;

  const margin = 48;
  let y = height - margin;

  page.drawText(title, { x: margin, y: y - fontSizeTitle, size: fontSizeTitle, font });
  y -= fontSizeTitle + 18;

  const maxWidth = width - margin * 2;
  const words = text.split(/\s+/);
  let line = "";
  const outLines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const testWidth = font.widthOfTextAtSize(test, fontSizeBody);
    if (testWidth > maxWidth && line) {
      outLines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) outLines.push(line);

  const lineHeight = fontSizeBody + 4;
  for (const ln of outLines) {
    if (y - lineHeight < margin) break;
    page.drawText(ln, { x: margin, y: y - lineHeight, size: fontSizeBody, font });
    y -= lineHeight;
  }

  let bytes = await pdf.save();

  const url = new URL(req.url);
  const prefix = (url.searchParams.get("prefix") ?? "").trim();
  const start = Number(url.searchParams.get("batesStart") ?? "");
  const batesWidth = Number(url.searchParams.get("batesWidth") ?? "");
  if (prefix && Number.isFinite(start) && Number.isFinite(batesWidth) && start > 0 && batesWidth > 0) {
    const stamped = await stampPdfBates(new Uint8Array(bytes), {
      prefix,
      start,
      width: batesWidth,
    });
    bytes = stamped.pdf;
  }
  
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${draft.id}.pdf"`,
    },
  });
}
