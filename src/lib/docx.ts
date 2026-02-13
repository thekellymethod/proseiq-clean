
// src/lib/docx.ts
// Minimal DOCX generator (OOXML) using zipStore (STORE). Dependency-free.
// Produces editable Word documents with basic paragraphs + line breaks.

import { zipStore, ZipFile } from "./zip";

function escXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toParagraphs(text: string) {
  const raw = (text ?? "").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  const paras: string[] = [];
  let buf: string[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      if (buf.length) paras.push(buf.join("\n"));
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) paras.push(buf.join("\n"));
  return paras.length ? paras : [""];
}

function wP(text: string, opts?: { courtStyle?: boolean }) {
  const courtStyle = Boolean(opts?.courtStyle);
  const pPr = courtStyle
    ? `<w:pPr>
        <w:spacing w:line="480" w:lineRule="auto"/>
      </w:pPr>`
    : "";
  const rPr = courtStyle
    ? `<w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>`
    : "";

  // Preserve internal line breaks within a paragraph
  const parts = text.split("\n");
  const runs = parts
    .map((ln, i) => {
      const t = `<w:t xml:space="preserve">${escXml(ln)}</w:t>`;
      const br = i < parts.length - 1 ? "<w:br/>" : "";
      return `<w:r>${rPr}${t}${br}</w:r>`;
    })
    .join("");
  return `<w:p>${pPr}${runs}</w:p>`;
}

function wSignatureImage(rId: string) {
  // Fixed size (~2.0in wide x 0.5in tall)
  const cx = 2_000_000;
  const cy = 500_000;
  return `<w:p>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0"
        xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
        xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
        xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <wp:extent cx="${cx}" cy="${cy}"/>
        <wp:docPr id="1" name="Signature"/>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr>
                <pic:cNvPr id="0" name="signature.png"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>`;
}

export function buildDocx(opts: {
  frontMatter?: string;
  title: string;
  meta?: string;
  body: string;
  courtStyle?: boolean;
  signaturePng?: Uint8Array | null;
}): Uint8Array {
  const frontMatter = opts.frontMatter || "";
  const title = opts.title || "Draft";
  const meta = opts.meta || "";
  const courtStyle = Boolean(opts.courtStyle);
  const paras = toParagraphs(opts.body || "");
  const hasSig = Boolean(opts.signaturePng && opts.signaturePng.length > 0);
  const sigRelId = hasSig ? "rId2" : "";

  const fmParas = frontMatter ? toParagraphs(frontMatter) : [];

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${fmParas.length ? fmParas.map((x) => wP(x, { courtStyle })).join("\n") : ""}
    ${fmParas.length ? wP("", { courtStyle }) : ""}
    ${wP(title, { courtStyle })}
    ${meta ? wP(meta, { courtStyle }) : ""}
    ${wP("", { courtStyle })}
    ${paras.map((x) => wP(x, { courtStyle })).join("\n")}
    ${hasSig ? wP("", { courtStyle }) : ""}
    ${hasSig ? wSignatureImage(sigRelId) : ""}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasSig ? '<Default Extension="png" ContentType="image/png"/>' : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${hasSig ? '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/signature.png"/>' : ""}
</Relationships>`;

  const enc = new TextEncoder();

  const files: ZipFile[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypesXml) },
    { name: "_rels/.rels", data: enc.encode(relsXml) },
    { name: "word/document.xml", data: enc.encode(documentXml) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(wordRelsXml) },
    ...(hasSig ? [{ name: "word/media/signature.png", data: opts.signaturePng as Uint8Array }] : []),
  ];

  return zipStore(files);
}
