import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Minimal dependency-free PDF generator (Helvetica).
 * Supports multi-page text with basic word wrapping.
 */
function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxCharsPerLine: number) {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");

  for (const p of paragraphs) {
    if (p.trim() === "") {
      lines.push(""); // blank line
      continue;
    }
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (next.length > maxCharsPerLine) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }

  return lines;
}

function buildPdfBytes(opts: {
  title: string;
  meta: string;
  body: string;
}) {
  // US Letter
  const pageW = 612;
  const pageH = 792;
  const margin = 54;

  const fontSize = 11;
  const leading = 14;

  // crude char width approximation for Helvetica at 11pt
  const usableW = pageW - margin * 2;
  const approxCharW = 5.6; // ~ average at 11pt
  const maxCharsPerLine = Math.max(20, Math.floor(usableW / approxCharW));

  const headerLines = wrapText(`${opts.title}\n${opts.meta}\n`, maxCharsPerLine);
  const bodyLines = wrapText(opts.body || "", maxCharsPerLine);
  const allLines = [...headerLines, ...bodyLines];

  const usableH = pageH - margin * 2;
  const linesPerPage = Math.max(10, Math.floor(usableH / leading));

  const pages: string[] = [];
  let idx = 0;

  while (idx < allLines.length) {
    const chunk = allLines.slice(idx, idx + linesPerPage);
    idx += linesPerPage;

    // Start text object
    // 0 0 0 rg sets fill color black
    // BT ... ET
    // Td sets text position, Tj shows text, T* moves to next line
    let stream = "0 0 0 rg\nBT\n";
    stream += `/F1 ${fontSize} Tf\n`;
    stream += `${margin} ${pageH - margin} Td\n`;

    for (const line of chunk) {
      const safe = pdfEscape(line);
      stream += `(${safe}) Tj\nT*\n`;
    }
    stream += "ET\n";
    pages.push(stream);
  }

  // PDF objects
  // 1: Catalog
  // 2: Pages
  // 3..(2+n): Page objects
  // Font object
  // Contents objects per page
  const objects: string[] = [];
  const offsets: number[] = [];

  const pushObj = (s: string) => {
    offsets.push(0); // placeholder
    objects.push(s);
  };

  // Placeholder; build after we know object numbers
  // Object numbers:
  // 1 catalog
  // 2 pages
  // 3 font
  // then pages+contents: for each page i:
  // pageObj = 4 + i*2
  // contentObj = 5 + i*2
  const n = pages.length;

  pushObj(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Pages object; Kids filled later
  const kids = Array.from({ length: n }, (_, i) => `${4 + i * 2} 0 R`).join(" ");
  pushObj(
    `2 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${n} >>\nendobj\n`
  );

  // Font
  pushObj(
    `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );

  // Page + Contents objects
  for (let i = 0; i < n; i++) {
    const pageObjNum = 4 + i * 2;
    const contentsObjNum = 5 + i * 2;
    pushObj(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentsObjNum} 0 R >>\nendobj\n`
    );

    const stream = pages[i];
    const len = Buffer.byteLength(stream, "utf8");
    pushObj(
      `${contentsObjNum} 0 obj\n<< /Length ${len} >>\nstream\n${stream}endstream\nendobj\n`
    );
  }

  // Build final PDF with xref
  let pdf = "%PDF-1.4\n";
  for (let i = 0; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += objects[i];
  }

  const xrefPos = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

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
  const bytes = buildPdfBytes({
    title: d.title || "Draft",
    meta,
    body: d.content || "",
  });

  const filenameSafe = (d.title || "draft")
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 80);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameSafe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
