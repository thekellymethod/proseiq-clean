import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function batesStampPdfBytes(opts: {
  pdfBytes: Uint8Array;
  prefix: string;
  start: number;
  width: number;
}) {
  const doc = await PDFDocument.load(opts.pdfBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  let n = opts.start;
  for (const p of pages) {
    const { width, height } = p.getSize();
    const label = `${opts.prefix}-${String(n).padStart(opts.width, "0")}`;

    p.drawText(label, {
      x: 36,
      y: 18,
      size: 10,
      font,
      color: rgb(0, 0, 0),
      opacity: 0.9,
    });

    n++;
  }

  const out = await doc.save();
  return { stamped: new Uint8Array(out), pages: pages.length, next: n };
}
