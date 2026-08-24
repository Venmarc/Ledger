/**
 * Generates PWA icons (192, 512, 512-maskable) from public/logo.svg,
 * replicating the apple-touch-logo.png composition (measured reference):
 *   tile #111111, glyph centered, width ≈45.6% / height ≈64.4% of the tile.
 * The maskable variant scales the glyph to fit the 80% safe zone.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";

const TILE = "#111111";
const REGULAR = { widthFrac: 0.456, heightFrac: 0.644 };
const MASKABLE = { heightFrac: 0.6 };
const OUT = {
  "public/icon-192x192.png": { size: 192, ...REGULAR },
  "public/icon-512x512.png": { size: 512, ...REGULAR },
  "public/icon-512-maskable.png": { size: 512, maskable: true, ...MASKABLE },
};

// sharp rasterizes logo.svg correctly only when explicit width/height are
// injected (a bare viewBox render misplaces the glyphs).
const svg = readFileSync("public/logo.svg", "utf-8").replace(
  "<svg ",
  '<svg width="1323" height="1323" '
);

const WORK = 1024;
const glyph = await sharp(Buffer.from(svg))
  .resize(WORK, WORK)
  .png()
  .toBuffer();
const trimmed = await sharp(glyph).trim().png().toBuffer();
const meta = await sharp(trimmed).metadata();
const naturalAspect = meta.height / meta.width;

for (const [file, cfg] of Object.entries(OUT)) {
  const size = cfg.size;
  let glyphW = Math.round(size * cfg.widthFrac);
  if (cfg.maskable) glyphW = Math.round((size * cfg.heightFrac) / naturalAspect);
  const glyphH = Math.round(glyphW * naturalAspect);
  const left = Math.round((size - glyphW) / 2);
  const top = Math.round((size - glyphH) / 2);

  const tile = await sharp({
    create: { width: size, height: size, channels: 3, background: TILE },
  })
    .png()
    .toBuffer();

  await sharp(tile)
    .composite([
      {
        input: await sharp(trimmed).resize(glyphW, glyphH).png().toBuffer(),
        left,
        top,
      },
    ])
    .png()
    .toFile(file);
  console.log(`wrote ${file} (${size}x${size}, glyph ${glyphW}x${glyphH} at ${left},${top})`);
}