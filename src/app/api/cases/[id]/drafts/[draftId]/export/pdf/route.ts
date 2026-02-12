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

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "listItem"; ordered: boolean; index: number; text: string };

function textFromRich(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return String(node.text ?? "");
  if (node.type === "hardBreak") return "\n";
  const kids = Array.isArray(node.content) ? node.content : [];
  return kids.map(textFromRich).join("");
}

function normalizeWhitespace(s: string) {
  return String(s ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function richToBlocks(doc: any): Block[] {
  // Tiptap JSON (StarterKit). We preserve headings/paragraphs/lists.
  const out: Block[] = [];

  function walk(node: any) {
    if (!node) return;
    const type = node.type;
    if (type === "heading") {
      const level = Number(node?.attrs?.level ?? 2);
      const text = normalizeWhitespace(textFromRich(node));
      if (text) out.push({ type: "heading", level, text });
      return;
    }
    if (type === "paragraph") {
      const text = normalizeWhitespace(textFromRich(node));
      // keep an explicit blank paragraph as spacing
      out.push({ type: "paragraph", text });
      return;
    }
    if (type === "bulletList" || type === "orderedList") {
      const ordered = type === "orderedList";
      const items = Array.isArray(node.content) ? node.content : [];
      let idx = 1;
      for (const it of items) {
        if (it?.type !== "listItem") continue;
        const text = normalizeWhitespace(textFromRich(it));
        out.push({ type: "listItem", ordered, index: idx, text });
        idx++;
      }
      return;
    }

    const kids = Array.isArray(node.content) ? node.content : [];
    for (const k of kids) walk(k);
  }

  walk(doc);

  // If we produced nothing, fall back to one blank paragraph.
  if (!out.length) out.push({ type: "paragraph", text: "" });
  return out;
}

function plainToBlocks(text: string): Block[] {
  const raw = String(text ?? "").replace(/\r/g, "");
  const paras = raw.split(/\n{2,}/).map((p) => p.trimEnd());
  const blocks = paras.map((p) => ({ type: "paragraph", text: p.trim() || "" } as const));
  return blocks.length ? blocks : [{ type: "paragraph", text: "" }];
}

function wrapWords(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const testWidth = font.widthOfTextAtSize(test, fontSize);
    if (testWidth > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function safeUpper(s: string) {
  return String(s ?? "").toUpperCase();
}

function joinNames(names: string[]) {
  const clean = (names ?? []).map((x) => String(x ?? "").trim()).filter(Boolean);
  return clean.length ? clean.join(", ") : "";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const [{ data: draft, error }, { data: caseRow }, { data: intakeRow }, { data: parties }] = await Promise.all([
    supabase
    .from("case_drafts")
    .select("id,title,content,content_rich,updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title")
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle(),
    supabase.from("cases").select("id,title").eq("id", id).maybeSingle(),
    supabase.from("case_intakes").select("case_id,intake").eq("case_id", id).maybeSingle(),
    supabase.from("case_parties").select("id,role,name").eq("case_id", id),
  ]);

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
  const pageSize: [number, number] = [612, 792]; // US Letter
  let page = pdf.addPage(pageSize);
  let { width, height } = page.getSize();

  const docTitle = String(draft.title ?? "Draft");
  const rich = draft.content_rich && typeof draft.content_rich === "object" ? draft.content_rich : null;
  const blocks = rich ? richToBlocks(rich) : plainToBlocks(draft.content ?? "");
  const filing = (rich?.attrs?.filing && typeof rich.attrs.filing === "object" ? rich.attrs.filing : {}) as any;

  const fontBody = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const fontSizeBody = 12; // court default
  const fontSizeTitle = 14;

  const marginLeft = 72;
  const marginRight = 72;
  const marginTop = 72;
  const marginBottom = 72;
  const maxWidth = width - marginLeft - marginRight;

  // Court-ish spacing (double spaced body)
  const lineHeight = fontSizeBody * 2; // double space
  const paragraphGap = lineHeight; // blank line between paragraphs
  const firstLineIndent = 36; // 0.5 inch

  let y = height - marginTop;

  function newPage() {
    page = pdf.addPage(pageSize);
    ({ width, height } = page.getSize());
    y = height - marginTop;
  }

  function ensureSpace(needed: number) {
    if (y - needed < marginBottom) newPage();
  }

  function drawLine(text: string, opts: { x: number; font: any; size: number }) {
    page.drawText(text, { x: opts.x, y: y - opts.size, font: opts.font, size: opts.size });
    y -= lineHeight;
  }

  // --- Caption / header block ---
  const intake = (intakeRow as any)?.intake ?? {};
  const courtNameRaw =
    String(intake?.venue ?? "").trim() ||
    String(intake?.jurisdiction ?? "").trim() ||
    (String(intake?.forum ?? "").trim() ? `${String(intake.forum).trim()} FORUM` : "COURT");
  const courtName = safeUpper(courtNameRaw);
  const caseNumber = String(intake?.case_number ?? "").trim();

  const partyRows = (parties as any[]) ?? [];
  const plaintiffs = partyRows.filter((p) => ["plaintiff", "petitioner"].includes(String(p.role))).map((p) => p.name);
  const defendants = partyRows.filter((p) => ["defendant", "respondent"].includes(String(p.role))).map((p) => p.name);

  const plaintiffLine = joinNames(plaintiffs) || "[PLAINTIFF]";
  const defendantLine = joinNames(defendants) || "[DEFENDANT]";

  // Court name centered
  ensureSpace(lineHeight * 6);
  {
    const t = courtName;
    const tw = fontBold.widthOfTextAtSize(t, fontSizeBody);
    page.drawText(t, { x: Math.max(marginLeft, (width - tw) / 2), y: y - fontSizeBody, font: fontBold, size: fontSizeBody });
    y -= paragraphGap;
  }

  // Two-column caption (left parties, right case number)
  const rightColW = 180;
  const gutter = 18;
  const leftColW = maxWidth - rightColW - gutter;
  const leftX = marginLeft;
  const rightX = marginLeft + leftColW + gutter;

  const captionLinesLeft = [
    `${plaintiffLine},`,
    "Plaintiff,",
    "v.",
    `${defendantLine},`,
    "Defendant.",
  ];
  const captionLinesRight = caseNumber ? [`Case No.: ${caseNumber}`] : [];

  // Wrap the potentially long party name lines to left column.
  const leftRendered: string[] = [];
  for (const ln of captionLinesLeft) {
    leftRendered.push(...wrapWords(ln, fontBody, fontSizeBody, leftColW));
  }
  const rightRendered: string[] = [];
  for (const ln of captionLinesRight) {
    rightRendered.push(...wrapWords(ln, fontBody, fontSizeBody, rightColW));
  }

  const maxCaptionLines = Math.max(leftRendered.length, rightRendered.length, 1);
  ensureSpace(lineHeight * (maxCaptionLines + 2));
  for (let i = 0; i < maxCaptionLines; i++) {
    const l = leftRendered[i] ?? "";
    const r = rightRendered[i] ?? "";
    if (l) page.drawText(l, { x: leftX, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    if (r) page.drawText(r, { x: rightX, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= lineHeight;
  }
  y -= lineHeight / 2;

  // Horizontal rule
  page.drawLine({
    start: { x: marginLeft, y: y },
    end: { x: width - marginRight, y: y },
    thickness: 1,
  });
  y -= paragraphGap;

  // Document title centered
  {
    const t = safeUpper(docTitle);
    const tw = fontBold.widthOfTextAtSize(t, fontSizeTitle);
    ensureSpace(paragraphGap);
    page.drawText(t, { x: Math.max(marginLeft, (width - tw) / 2), y: y - fontSizeTitle, font: fontBold, size: fontSizeTitle });
    y -= paragraphGap;
  }

  // --- Body blocks ---
  for (const b of blocks) {
    if (b.type === "heading") {
      const text = normalizeWhitespace(b.text);
      if (!text) {
        y -= paragraphGap;
        continue;
      }
      const size = fontSizeBody;
      ensureSpace(lineHeight * 2);
      // Add small spacing above headings
      y -= lineHeight / 2;
      const lines = wrapWords(text, fontBold, size, maxWidth);
      for (const ln of lines) {
        ensureSpace(lineHeight);
        page.drawText(ln, { x: marginLeft, y: y - size, font: fontBold, size });
        y -= lineHeight;
      }
      y -= lineHeight / 2;
      continue;
    }

    if (b.type === "listItem") {
      const prefix = b.ordered ? `${b.index}. ` : "• ";
      const text = normalizeWhitespace(b.text);
      const size = fontSizeBody;
      const bulletIndent = 18;
      const startX = marginLeft;
      const textX = marginLeft + bulletIndent;
      const bulletW = fontBody.widthOfTextAtSize(prefix, size);

      // Wrap list item text with hanging indent.
      const lines = wrapWords(text, fontBody, size, maxWidth - bulletIndent);
      ensureSpace(lineHeight * Math.max(lines.length, 1));
      if (lines.length) {
        page.drawText(prefix, { x: startX, y: y - size, font: fontBody, size });
        page.drawText(lines[0], { x: textX, y: y - size, font: fontBody, size });
        y -= lineHeight;
        for (const ln of lines.slice(1)) {
          ensureSpace(lineHeight);
          page.drawText(ln, { x: textX, y: y - size, font: fontBody, size });
          y -= lineHeight;
        }
      } else {
        page.drawText(prefix, { x: startX, y: y - size, font: fontBody, size });
        y -= lineHeight;
      }
      y -= lineHeight / 2;
      continue;
    }

    // Paragraph
    const text = String(b.text ?? "");
    if (!text.trim()) {
      y -= paragraphGap;
      continue;
    }
    const size = fontSizeBody;

    // Support explicit single newlines inside a paragraph as hard breaks.
    const softParts = text.replace(/\r/g, "").split("\n").map((x) => x.trim()).filter(Boolean);
    const paraText = softParts.join(" ");
    const linesFirst = wrapWords(paraText, fontBody, size, maxWidth - firstLineIndent);
    const restText = linesFirst.join("\n"); // we already wrapped once; we will re-wrap with correct widths below

    // First line with indent; subsequent lines without.
    const words = paraText.split(/\s+/).filter(Boolean);
    let cursorWords = [...words];
    const rendered: string[] = [];
    // Build lines with different widths (first vs rest)
    for (let lineIdx = 0; cursorWords.length; lineIdx++) {
      const avail = lineIdx === 0 ? maxWidth - firstLineIndent : maxWidth;
      let line = "";
      while (cursorWords.length) {
        const w = cursorWords[0];
        const test = line ? `${line} ${w}` : w;
        if (fontBody.widthOfTextAtSize(test, size) > avail && line) break;
        line = test;
        cursorWords.shift();
      }
      if (!line) {
        // extremely long word; force it
        line = cursorWords.shift() ?? "";
      }
      rendered.push(line);
    }

    ensureSpace(lineHeight * rendered.length + lineHeight);
    for (let i = 0; i < rendered.length; i++) {
      const x = i === 0 ? marginLeft + firstLineIndent : marginLeft;
      page.drawText(rendered[i], { x, y: y - size, font: fontBody, size });
      y -= lineHeight;
    }
    y -= lineHeight / 2;
  }

  // Signature block (optional)
  {
    // Always include a signature section at the end; use uploaded image if present.
    const nameLine = String(draft.signature_name ?? "").trim() || "[NAME]";
    const titleLine = String(draft.signature_title ?? "").trim() || "";

    ensureSpace(lineHeight * 8);
    y -= paragraphGap / 2;
    page.drawText("Dated: ____________________", { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= paragraphGap;
    page.drawText("Respectfully submitted,", { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= paragraphGap;

    let embeddedSig: any = null;
    if (draft.signature_bucket && draft.signature_path) {
      const { data: blob, error: dlErr } = await supabase.storage.from(draft.signature_bucket).download(draft.signature_path);
      if (!dlErr && blob) {
        const imgBytes = new Uint8Array(await blob.arrayBuffer());
        try {
          embeddedSig = await pdf.embedPng(imgBytes);
        } catch {
          try {
            embeddedSig = await pdf.embedJpg(imgBytes);
          } catch {
            embeddedSig = null;
          }
        }
      }
    }

    if (embeddedSig) {
      const maxSigW = 240;
      const maxSigH = 72;
      const scale = Math.min(maxSigW / embeddedSig.width, maxSigH / embeddedSig.height, 1);
      const sigW = embeddedSig.width * scale;
      const sigH = embeddedSig.height * scale;
      ensureSpace(sigH + lineHeight * 3);
      page.drawImage(embeddedSig, { x: marginLeft, y: y - sigH, width: sigW, height: sigH });
      y -= sigH + lineHeight / 2;
    } else {
      // signature line
      ensureSpace(lineHeight * 2);
      page.drawLine({
        start: { x: marginLeft, y: y - 10 },
        end: { x: marginLeft + 260, y: y - 10 },
        thickness: 1,
      });
      y -= paragraphGap;
    }

    page.drawText(nameLine, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= lineHeight;
    if (titleLine) {
      page.drawText(titleLine, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
      y -= lineHeight;
    }
  }

  // --- Optional export blocks (certificate of service / notary) ---
  // These are appended after the signature section, if enabled.
  const serviceEnabled = Boolean(filing?.service?.enabled);
  const notaryEnabled = Boolean(filing?.notary?.enabled);
  if (serviceEnabled || notaryEnabled) {
    y -= paragraphGap / 2;
    ensureSpace(lineHeight * 10);
  }

  if (serviceEnabled) {
    const svcDate = String(filing?.service?.date ?? "").trim() || "______________";
    const methodDefault = String(filing?.service?.methodDefault ?? "").trim();
    const methodDetails = String(filing?.service?.methodDetails ?? "").trim();
    const recipients = Array.isArray(filing?.service?.recipients) ? filing.service.recipients : [];

    // Heading
    {
      const t = "CERTIFICATE OF SERVICE";
      const tw = fontBold.widthOfTextAtSize(t, fontSizeBody);
      ensureSpace(paragraphGap);
      page.drawText(t, { x: Math.max(marginLeft, (width - tw) / 2), y: y - fontSizeBody, font: fontBold, size: fontSizeBody });
      y -= paragraphGap;
    }

    const methodLabel = (m: string) => {
      if (m === "certified_mail") return "certified mail";
      if (m === "email") return "email";
      if (m === "efile_provider") return "e-filing provider service";
      if (m === "process_server") return "process server";
      if (m === "publication") return "publication";
      if (m === "other") return "other";
      return "";
    };

    const lines: string[] = [];
    lines.push(
      `I certify that on ${svcDate}, I served the foregoing document on the following parties by the method(s) stated below.`
    );
    lines.push("");
    if (recipients.length) {
      for (const r of recipients) {
        const name = String(r?.name ?? "").trim();
        if (!name) continue;
        const addr = String(r?.addressOrEmail ?? "").trim();
        const m = String(r?.method ?? methodDefault ?? "").trim();
        const md = String(r?.details ?? "").trim();
        const parts = [
          name,
          addr ? `(${addr})` : "",
          m ? `— ${methodLabel(m) || m}` : "",
          md ? `(${md})` : "",
        ].filter(Boolean);
        lines.push(parts.join(" "));
      }
    } else {
      const m = methodLabel(methodDefault) || methodDefault || "[METHOD]";
      lines.push(`[RECIPIENT NAME] — ${m}`);
    }
    if (methodDetails) {
      lines.push("");
      lines.push(`Details: ${methodDetails}`);
    }

    // Render as paragraphs (double spaced)
    for (const para of lines.join("\n").split("\n\n")) {
      const p = para.trim();
      if (!p) {
        y -= paragraphGap;
        continue;
      }
      const words = p.split(/\s+/).filter(Boolean);
      let cursorWords = [...words];
      const rendered: string[] = [];
      for (let lineIdx = 0; cursorWords.length; lineIdx++) {
        const avail = lineIdx === 0 ? maxWidth - firstLineIndent : maxWidth;
        let line = "";
        while (cursorWords.length) {
          const w = cursorWords[0];
          const test = line ? `${line} ${w}` : w;
          if (fontBody.widthOfTextAtSize(test, fontSizeBody) > avail && line) break;
          line = test;
          cursorWords.shift();
        }
        if (!line) line = cursorWords.shift() ?? "";
        rendered.push(line);
      }
      ensureSpace(lineHeight * rendered.length + lineHeight);
      for (let i = 0; i < rendered.length; i++) {
        const x = i === 0 ? marginLeft + firstLineIndent : marginLeft;
        page.drawText(rendered[i], { x, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
        y -= lineHeight;
      }
      y -= lineHeight / 2;
    }
  }

  if (notaryEnabled) {
    const nType = String(filing?.notary?.type ?? "").trim() || "jurat";
    const state = String(filing?.notary?.state ?? "").trim() || "________";
    const county = String(filing?.notary?.county ?? "").trim() || "________";
    const nDate = String(filing?.notary?.date ?? "").trim() || "______________";
    const notaryName = String(filing?.notary?.notaryName ?? "").trim() || "________________";
    const expires = String(filing?.notary?.commissionExpires ?? "").trim();

    // Heading
    {
      const t = nType === "acknowledgment" ? "NOTARY ACKNOWLEDGMENT" : "JURAT";
      const tw = fontBold.widthOfTextAtSize(t, fontSizeBody);
      ensureSpace(paragraphGap);
      page.drawText(t, { x: Math.max(marginLeft, (width - tw) / 2), y: y - fontSizeBody, font: fontBold, size: fontSizeBody });
      y -= paragraphGap;
    }

    const para =
      nType === "acknowledgment"
        ? `State of ${state}\nCounty of ${county}\n\nOn ${nDate}, before me, ${notaryName}, Notary Public, personally appeared ______________________, proved to me on the basis of satisfactory evidence to be the person(s) whose name(s) is/are subscribed to the within instrument and acknowledged to me that he/she/they executed the same.`
        : `State of ${state}\nCounty of ${county}\n\nSubscribed and sworn to (or affirmed) before me on ${nDate}, by ______________________.`;

    for (const ln of para.split("\n")) {
      const t = ln.trim();
      if (!t) {
        y -= paragraphGap;
        continue;
      }
      const lines = wrapWords(t, fontBody, fontSizeBody, maxWidth);
      ensureSpace(lineHeight * lines.length + lineHeight);
      for (const l of lines) {
        page.drawText(l, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
        y -= lineHeight;
      }
      y -= lineHeight / 2;
    }

    ensureSpace(lineHeight * 3);
    page.drawLine({
      start: { x: marginLeft, y: y - 10 },
      end: { x: marginLeft + 260, y: y - 10 },
      thickness: 1,
    });
    y -= paragraphGap;
    page.drawText("Notary Public", { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= lineHeight;
    if (expires) {
      page.drawText(`My commission expires: ${expires}`, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
      y -= lineHeight;
    }
    y -= lineHeight / 2;
  }

  // --- Proposed order (judge signature area) ---
  if (Boolean(filing?.proposedOrder?.enabled)) {
    newPage();
    const orderTitle = String(filing?.proposedOrder?.title ?? "").trim() || "PROPOSED ORDER";
    const judgeName = String(filing?.proposedOrder?.judgeName ?? "").trim();
    const judgeTitle = String(filing?.proposedOrder?.judgeTitle ?? "").trim() || "Judge";
    const orderDate = String(filing?.proposedOrder?.date ?? "").trim();

    // Title
    {
      const t = safeUpper(orderTitle);
      const tw = fontBold.widthOfTextAtSize(t, fontSizeTitle);
      page.drawText(t, { x: Math.max(marginLeft, (width - tw) / 2), y: y - fontSizeTitle, font: fontBold, size: fontSizeTitle });
      y -= paragraphGap * 2;
    }

    // Signature line
    ensureSpace(lineHeight * 6);
    page.drawText("IT IS SO ORDERED.", { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= paragraphGap * 2;

    page.drawLine({
      start: { x: marginLeft, y: y - 10 },
      end: { x: marginLeft + 320, y: y - 10 },
      thickness: 1,
    });
    y -= paragraphGap;
    page.drawText(judgeName || "Judge", { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= lineHeight;
    page.drawText(judgeTitle, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= paragraphGap;
    page.drawText(`Date: ${orderDate || "______________"}`, { x: marginLeft, y: y - fontSizeBody, font: fontBody, size: fontSizeBody });
    y -= lineHeight;
  }

  // --- Page numbers (footer) ---
  {
    const pages = pdf.getPages();
    const count = pages.length;
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const size = 9;
    for (let i = 0; i < count; i++) {
      const p = pages[i];
      const label = `Page ${i + 1} of ${count}`;
      const tw = font.widthOfTextAtSize(label, size);
      const x = (pageSize[0] - tw) / 2;
      const yFooter = 36; // keep above Bates stamp (default 24)
      p.drawText(label, { x, y: yFooter, font, size });
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
