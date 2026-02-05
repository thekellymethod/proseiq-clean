
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

function wP(text: string) {
  // Preserve internal line breaks within a paragraph
  const parts = text.split("\n");
  const runs = parts
    .map((ln, i) => {
      const t = `<w:t xml:space="preserve">${escXml(ln)}</w:t>`;
      const br = i < parts.length - 1 ? "<w:br/>" : "";
      return `<w:r>${t}${br}</w:r>`;
    })
    .join("");
  return `<w:p>${runs}</w:p>`;
}

export function buildDocx(opts: { title: string; meta?: string; body: string }): Uint8Array {
  const title = opts.title || "Draft";
  const meta = opts.meta || "";
  const paras = toParagraphs(opts.body || "");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${wP(title)}
    ${meta ? wP(meta) : ""}
    ${wP("")}
    ${paras.map(wP).join("\n")}
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
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;

  const enc = new TextEncoder();

  const files: ZipFile[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypesXml) },
    { name: "_rels/.rels", data: enc.encode(relsXml) },
    { name: "word/document.xml", data: enc.encode(documentXml) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(wordRelsXml) },
  ];

  return zipStore(files);
}
