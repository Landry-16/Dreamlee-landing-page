/**
 * Renders the « Le Continent » map (same seed as the live demo) to a PNG,
 * for the objects that show it before any script runs.
 *
 *   pnpm dlx tsx scripts/render-map.ts
 */
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { generateTerrain } from "../src/lib/terrain/generate";
import { renderTerrain } from "../src/lib/terrain/render";
import { MAP_DEFAULTS } from "../src/lib/terrain/defaults";

const CELLS = { width: 180, height: 120 };
const PIXELS_PER_CELL = 3;

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, "ascii"), Buffer.from(data)]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function encodePng(width: number, height: number, rgba: Uint8ClampedArray): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x += 1) {
      const from = (y * width + x) * 4;
      raw.set([rgba[from] ?? 0, rgba[from + 1] ?? 0, rgba[from + 2] ?? 0], row + 1 + x * 3);
    }
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", new Uint8Array()),
  ]);
}

const terrain = generateTerrain(MAP_DEFAULTS, CELLS.width, CELLS.height);
const width = CELLS.width * PIXELS_PER_CELL;
const height = CELLS.height * PIXELS_PER_CELL;
const image = { width, height, data: new Uint8ClampedArray(width * height * 4) } as ImageData;
renderTerrain(image, terrain, PIXELS_PER_CELL);
writeFileSync("src/assets/map-continent.png", encodePng(width, height, image.data));
console.log(`src/assets/map-continent.png (${width}×${height})`);
