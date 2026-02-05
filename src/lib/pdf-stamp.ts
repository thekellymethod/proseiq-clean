
// src/lib/pdf-stamp.ts
// Tier B: True per-page Bates stamping for PDFs using pdf-lib.
// Install: npm i pdf-lib
//
// Notes:
// - Stamps only PDF inputs (Uint8Array).
// - Uses a conservative bottom-right placement to avoid most footer content.
// - Returns stamped PDF bytes + pageCount.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type BatesOptions = {
  prefix: string;     // e.g., PROSEIQ
  start: number;      // first number
  width: number;      // zero pad width
  fontSize?: number;  // default 9
  margin?: number;    // default 24
};

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

export async function stampPdfBates(
  inputPdf: Uint8Array,
  opts: BatesOptions
): Promise<{ pdf: Uint8Array; pageCount: number; start: number; end: number }> {
  const doc = await PDFDocument.load(inputPdf, { ignoreEncryption: true });
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const fontSize = opts.fontSize ?? 9;
  const margin = opts.margin ?? 24;

  const start = opts.start;
  let cursor = start;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const label = `${opts.prefix}-${pad(cursor, opts.width)}`;

    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const x = Math.max(margin, width - margin - textWidth);
    const y = Math.max(margin, margin);

    // White-ish background behind the text for readability (subtle)
    // You can remove this if you prefer.
    const bgPadX = 3;
    const bgPadY = 2;
    page.drawRectangle({
      x: x - bgPadX,
      y: y - bgPadY,
      width: textWidth + bgPadX * 2,
      height: fontSize + bgPadY * 2,
      color: rgb(1, 1, 1),
      opacity: 0.65,
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 0.25,
    });

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.12, 0.12, 0.12),
    });

    cursor++;
  }

  const out = await doc.save();
  const pageCount = pages.length;
  const end = start + pageCount - 1;

  return { pdf: new Uint8Array(out), pageCount, start, end };
}
