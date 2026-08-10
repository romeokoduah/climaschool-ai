// Generates brand PNG icons (no external deps) using Node's zlib.
// Run: node scripts/gen-icons.mjs  — outputs public/icon-192.png and icon-512.png
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public");
mkdirSync(outDir, { recursive: true });

// CRC32
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makeIcon(size) {
  // brand: full-bleed orange (#ff6a3d) with centered white circle
  const bg = [0xff, 0x6a, 0x3d];
  const fg = [0xff, 0xff, 0xff];
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.30; // white disc
  const rInner = size * 0.125; // orange core inside the disc

  const stride = size * 4 + 1; // +1 filter byte per row
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      let c = bg;
      if (d <= rOuter) c = fg;
      if (d <= rInner) c = bg;
      const o = y * stride + 1 + x * 4;
      raw[o] = c[0];
      raw[o + 1] = c[1];
      raw[o + 2] = c[2];
      raw[o + 3] = 0xff;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), makeIcon(size));
  console.log(`wrote public/icon-${size}.png`);
}
