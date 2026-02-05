
// src/lib/zip.ts
// Minimal ZIP writer (STORE / no compression). Dependency-free.
// Supports nested paths like "word/document.xml" without explicit directory entries.

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      const mask = -(c & 1);
      c = (c >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function te(s: string) {
  return new TextEncoder().encode(s);
}

function u16(n: number) {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function concat(chunks: Uint8Array[]) {
  const len = chunks.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

export type ZipFile = { name: string; data: Uint8Array };

type Entry = {
  name: string;
  crc: number;
  size: number;
  offset: number;
};

export function zipStore(files: ZipFile[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const entries: Entry[] = [];

  let offset = 0;

  for (const f of files) {
    const nameBytes = te(f.name);
    const data = f.data;
    const crc = crc32(data);
    const size = data.length;

    // Local File Header
    const localHeader = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0), // method 0 (store)
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ]);

    locals.push(localHeader, data);
    entries.push({ name: f.name, crc, size, offset });

    offset += localHeader.length + data.length;
  }

  const centralParts: Uint8Array[] = [];
  let centralSize = 0;

  for (const e of entries) {
    const nameBytes = te(e.name);

    // Central Directory Header
    const cdh = concat([
      u32(0x02014b50),
      u16(20), // version made by
      u16(20), // version needed
      u16(0), // flags
      u16(0), // method store
      u16(0), // mod time
      u16(0), // mod date
      u32(e.crc),
      u32(e.size),
      u32(e.size),
      u16(nameBytes.length),
      u16(0), // extra len
      u16(0), // comment len
      u16(0), // disk start
      u16(0), // internal attrs
      u32(0), // external attrs
      u32(e.offset),
      nameBytes,
    ]);

    centralParts.push(cdh);
    centralSize += cdh.length;
  }

  const centralOffset = offset;

  // End of Central Directory
  const eocd = concat([
    u32(0x06054b50),
    u16(0), // disk
    u16(0), // start disk
    u16(entries.length),
    u16(entries.length),
    u32(centralSize),
    u32(centralOffset),
    u16(0), // comment length
  ]);

  return concat([...locals, ...centralParts, eocd]);
}
