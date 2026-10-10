#!/usr/bin/env node
/**
 * Stamps the library's files with a BECE Vault watermark, in place:
 *   - PDFs: a thin strip added below every page with a clickable "Available on notes.arpanadhikari7.com.np"
 *     line, and a very light logo in the middle of the page (the same look as website downloads).
 *   - Images (jpg, png): the same line in a strip below the picture, and the light logo.
 * Every stamped file carries a marker, so running this again never stamps a file twice.
 * Word, PowerPoint, code and other files are left unchanged.
 *
 * Usage (from Website/):
 *   node scripts/watermark.mjs <files...>       stamp these files
 *   node scripts/watermark.mjs --all             stamp every note file tracked by git
 *   node scripts/watermark.mjs --check <files>   only list files that still need stamping (exit 1 if any)
 *   node scripts/watermark.mjs --out <dir> ...   write stamped copies into <dir> instead of in place
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb } from 'pdf-lib';

const SITE_HOST = 'notes.arpanadhikari7.com.np';
const SITE_URL = `https://${SITE_HOST}`;
const TEXT = `Available on ${SITE_HOST}`;
/** Info-dictionary key (PDF) and EXIF description (images) that mark a stamped file. */
const MARK_KEY = 'BECEVaultWatermark';
const MARK = 'BECE Vault watermark v1';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '../..');
/** A small copy of the logo (≈300 px): it's embedded once per file, so it stays light. */
const LOGO = path.join(here, 'watermark-logo.png');
/** The library's top-level folders (the same ones the website reads). */
const ROOTS = /^(Semester_\d+|Electives|Engineering Entrance Preparation|Past Question Collection)\//;

const PDF = /\.pdf$/i;
const IMAGE = /\.(jpe?g|png)$/i;

/* ------------------------------- PDF ------------------------------- */

async function isStampedPdf(bytes) {
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    return pdf.getInfoDict().has(PDFName.of(MARK_KEY));
  } catch {
    return false;
  }
}

async function stampPdf(bytes, logoBytes) {
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  if (pdf.getInfoDict().has(PDFName.of(MARK_KEY))) return null;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const logo = await pdf.embedPng(logoBytes);
  for (const page of pdf.getPages()) {
    const rotation = ((page.getRotation().angle % 360) + 360) % 360;
    // Text scales with the page, so big scanned pages get a readable line too (8 pt on A4).
    const { width: pw, height: ph } = page.getCropBox();
    const size = Math.max(8, Math.min(pw, ph) / 75);
    const strip = size * 2;
    const baseline = size * 0.6;
    const textWidth = font.widthOfTextAtSize(TEXT, size);
    // A strip is added on the side that's at the bottom as displayed, so the line never covers the notes.
    const grow = (b) =>
      rotation === 90 ? { ...b, width: b.width + strip }
      : rotation === 180 ? { ...b, height: b.height + strip }
      : rotation === 270 ? { ...b, x: b.x - strip, width: b.width + strip }
      : { ...b, y: b.y - strip, height: b.height + strip };
    const media = grow(page.getMediaBox());
    const crop = grow(page.getCropBox());
    page.setMediaBox(media.x, media.y, media.width, media.height);
    page.setCropBox(crop.x, crop.y, crop.width, crop.height);
    const { x: cx, y: cy, width: W, height: H } = crop;

    let x, y;
    if (rotation === 90) { x = cx + W - baseline; y = cy + (H - textWidth) / 2; }
    else if (rotation === 180) { x = cx + (W + textWidth) / 2; y = cy + H - baseline; }
    else if (rotation === 270) { x = cx + baseline; y = cy + (H + textWidth) / 2; }
    else { x = cx + (W - textWidth) / 2; y = cy + baseline; }
    page.drawText(TEXT, { x, y, size, font, color: rgb(0.35, 0.4, 0.38), opacity: 0.85, rotate: degrees(rotation) });

    // Very light logo, about 45% of the shorter side, centred and upright as displayed.
    const w = Math.min(W, H) * 0.45;
    const h = (w * logo.height) / logo.width;
    const rad = (rotation * Math.PI) / 180;
    page.drawImage(logo, {
      x: cx + W / 2 - ((w / 2) * Math.cos(rad) - (h / 2) * Math.sin(rad)),
      y: cy + H / 2 - ((w / 2) * Math.sin(rad) + (h / 2) * Math.cos(rad)),
      width: w,
      height: h,
      rotate: degrees(rotation),
      opacity: 0.07,
    });

    const pad = 2;
    const rect = rotation === 90 ? [x - size - pad, y - pad, x + pad, y + textWidth + pad]
      : rotation === 180 ? [x - textWidth - pad, y - pad, x + pad, y + size + pad]
      : rotation === 270 ? [x - pad, y - textWidth - pad, x + size + pad, y + pad]
      : [x - pad, y - pad, x + textWidth + pad, y + size + pad];
    const link = pdf.context.register(pdf.context.obj({
      Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(SITE_URL) },
    }));
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (annots) annots.push(link);
    else page.node.set(PDFName.of('Annots'), pdf.context.obj([link]));
  }

  pdf.getInfoDict().set(PDFName.of(MARK_KEY), PDFString.of(MARK));
  return pdf.save({ useObjectStreams: true });
}

/* ------------------------------ Images ------------------------------ */

async function sharpLib() {
  const sharp = (await import('sharp')).default;
  // No file caching: on Windows a cached handle stops the file being overwritten in place.
  sharp.cache(false);
  return sharp;
}

async function isStampedImage(file) {
  const sharp = await sharpLib();
  const { exif } = await sharp(fs.readFileSync(file)).metadata();
  return !!exif && exif.includes(Buffer.from(MARK));
}

async function stampImage(file, logoBytes) {
  const sharp = await sharpLib();
  if (await isStampedImage(file)) return null;
  const img = sharp(fs.readFileSync(file)).rotate(); // apply EXIF orientation first, so the strip goes at the real bottom
  const { width, height } = await img.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const stripH = Math.max(22, Math.round(width * 0.03));
  const fontSize = Math.round(stripH * 0.5);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const strip = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${stripH}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="${fontSize}" fill="#5a6661">${esc(TEXT)}</text></svg>`,
  );
  const logoW = Math.round(Math.min(width, height) * 0.45);
  const logo = await sharp(logoBytes).resize({ width: logoW }).ensureAlpha(0.07).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  // Scale the logo's own alpha down to ~7%.
  const faint = await sharp(logo).composite([{ input: Buffer.from([255, 255, 255, Math.round(255 * 0.07)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }]).png().toBuffer();
  const out = sharp({ create: { width, height: height + stripH, channels: 3, background: '#ffffff' } })
    .composite([
      { input: await img.toBuffer(), top: 0, left: 0 },
      { input: faint, top: Math.round((height - logoMeta.height) / 2), left: Math.round((width - logoMeta.width) / 2) },
      { input: strip, top: height, left: 0 },
    ])
    .withMetadata({ exif: { IFD0: { ImageDescription: MARK } } });
  return /\.png$/i.test(file) ? out.png().toBuffer() : out.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

/* ------------------------------- CLI ------------------------------- */

export async function needsStamp(file) {
  if (PDF.test(file)) return !(await isStampedPdf(fs.readFileSync(file)));
  if (IMAGE.test(file)) return !(await isStampedImage(file));
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const outIdx = args.indexOf('--out');
  const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : null;
  let files = args.filter((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1));
  if (args.includes('--all')) {
    files = execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '-z'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 })
      .split('\0').filter((f) => ROOTS.test(f)).map((f) => path.join(REPO, f));
  }
  files = files.filter((f) => (PDF.test(f) || IMAGE.test(f)) && fs.existsSync(f));

  const logoBytes = fs.readFileSync(LOGO);
  let stamped = 0, skipped = 0, failed = 0;
  const pending = [];
  for (const file of files) {
    const rel = path.relative(REPO, path.resolve(file)).replace(/\\/g, '/');
    try {
      if (check) {
        // Printed exactly as given, so callers can match it to their own list.
        if (await needsStamp(file)) pending.push(file);
        continue;
      }
      const out = PDF.test(file) ? await stampPdf(fs.readFileSync(file), logoBytes) : await stampImage(file, logoBytes);
      if (!out) { skipped++; continue; }
      const dest = outDir ? path.join(outDir, rel) : file;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, out);
      stamped++;
      console.log(`stamped  ${rel}`);
    } catch (err) {
      failed++;
      console.warn(`FAILED   ${rel}: ${err.message}`);
    }
  }
  if (check) {
    pending.forEach((f) => console.log(`unstamped  ${f}`));
    console.log(`${pending.length} of ${files.length} files need a watermark`);
    process.exit(pending.length ? 1 : 0);
  }
  console.log(`done: ${stamped} stamped, ${skipped} already stamped, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
