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
    .select("id,title,content,updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title")
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

  const text = mdToPlain(draft.content ?? "");
  const title = String(draft.title ?? "Draft");

  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontSizeTitle = 16;
  const fontSizeBody = 12;

  const margin = 72; // 1 inch
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

  // Signature block (optional)
  if (draft.signature_bucket && draft.signature_path) {
    const { data: blob, error: dlErr } = await supabase.storage.from(draft.signature_bucket).download(draft.signature_path);
    if (!dlErr && blob) {
      const imgBytes = new Uint8Array(await blob.arrayBuffer());
      let img: any = null;
      try {
        img = await pdf.embedPng(imgBytes);
      } catch {
        try {
          img = await pdf.embedJpg(imgBytes);
        } catch {
          img = null;
        }
      }

      if (img) {
        const maxSigW = 220;
        const maxSigH = 90;
        const scale = Math.min(maxSigW / img.width, maxSigH / img.height, 1);
        const sigW = img.width * scale;
        const sigH = img.height * scale;

        const blockY = Math.max(margin, y - 140);
        page.drawText("Signature:", { x: margin, y: blockY + sigH + 30, size: 10, font });
        page.drawImage(img, { x: margin, y: blockY + 20, width: sigW, height: sigH });

        const nameLine = String(draft.signature_name ?? "").trim();
        const titleLine = String(draft.signature_title ?? "").trim();
        if (nameLine) page.drawText(nameLine, { x: margin, y: blockY + 10, size: 10, font });
        if (titleLine) page.drawText(titleLine, { x: margin, y: blockY - 2, size: 10, font });
      }
    }
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
