/**
 * Adds a "Downloaded from notes.arpanadhikari7.com.np" credit to files people download,
 * print or open from the site. The stamping runs in the visitor's browser: PDFs get a small
 * clickable line in a thin strip added below every page, images get a thin strip under the picture.
 * Other formats (Word, PowerPoint, code...) are downloaded unchanged.
 */

export const SITE_HOST = 'notes.arpanadhikari7.com.np';
export const SITE_URL = `https://${SITE_HOST}`;
export const CREDIT_TEXT = `Downloaded from ${SITE_HOST}`;

/** Returns the PDF with a credit line on every page (or the original bytes if it can't be edited). */
export async function stampPdf(bytes: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  const original = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  try {
    // Loaded on demand so the PDF library only downloads when someone actually saves a file.
    const { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb } = await import('pdf-lib');
    const pdf = await PDFDocument.load(original, { ignoreEncryption: true, updateMetadata: false });
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const size = 8;
    // Each page gets a thin extra strip below its content for the credit line, so the line
    // never covers anything already on the page (many notes have their own footer there).
    const strip = 16;
    const baseline = 5;
    const textWidth = font.widthOfTextAtSize(CREDIT_TEXT, size);

    for (const page of pdf.getPages()) {
      const rotation = ((page.getRotation().angle % 360) + 360) % 360;

      // Grow the page on the side that is at the bottom *as displayed*.
      const grow = (b: { x: number; y: number; width: number; height: number }) =>
        rotation === 90 ? { ...b, width: b.width + strip }
        : rotation === 180 ? { ...b, height: b.height + strip }
        : rotation === 270 ? { ...b, x: b.x - strip, width: b.width + strip }
        : { ...b, y: b.y - strip, height: b.height + strip };
      const media = grow(page.getMediaBox());
      const crop = grow(page.getCropBox());
      page.setMediaBox(media.x, media.y, media.width, media.height);
      page.setCropBox(crop.x, crop.y, crop.width, crop.height);
      const { x: cx, y: cy, width: W, height: H } = crop;

      // Bottom centre of the page as displayed, reading left to right.
      let x: number, y: number;
      if (rotation === 90) { x = cx + W - baseline; y = cy + (H - textWidth) / 2; }
      else if (rotation === 180) { x = cx + (W + textWidth) / 2; y = cy + H - baseline; }
      else if (rotation === 270) { x = cx + baseline; y = cy + (H + textWidth) / 2; }
      else { x = cx + (W - textWidth) / 2; y = cy + baseline; }

      page.drawText(CREDIT_TEXT, { x, y, size, font, color: rgb(0.35, 0.4, 0.38), opacity: 0.85, rotate: degrees(rotation) });

      // Make the line a clickable link back to the site.
      const pad = 2;
      const rect = rotation === 90 ? [x - size - pad, y - pad, x + pad, y + textWidth + pad]
        : rotation === 180 ? [x - textWidth - pad, y - pad, x + pad, y + size + pad]
        : rotation === 270 ? [x - pad, y - textWidth - pad, x + size + pad, y + pad]
        : [x - pad, y - pad, x + textWidth + pad, y + size + pad];
      const link = pdf.context.register(pdf.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: rect,
        Border: [0, 0, 0],
        A: { Type: 'Action', S: 'URI', URI: PDFString.of(SITE_URL) },
      }));
      const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
      if (annots) annots.push(link);
      else page.node.set(PDFName.of('Annots'), pdf.context.obj([link]));
    }

    pdf.setSubject(CREDIT_TEXT);
    return await pdf.save();
  } catch {
    // Damaged or protected PDFs: hand over the original rather than failing the download.
    return original;
  }
}

/** Returns the image with a thin credit strip added below it (or the original blob on failure). */
export async function stampImage(blob: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const strip = Math.max(22, Math.round(bitmap.width * 0.028));
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height + strip;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    ctx.fillStyle = '#173f37';
    ctx.fillRect(0, bitmap.height, canvas.width, strip);
    ctx.fillStyle = '#f8f4e9';
    ctx.font = `600 ${Math.round(strip * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CREDIT_TEXT, canvas.width / 2, bitmap.height + strip / 2);
    const type = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? blob), type, 0.92));
  } catch {
    return blob;
  }
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Downloads a file from the site, adding the credit line to PDFs and images. */
export async function downloadWithCredit(url: string, fileName: string, kind: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  if (kind === 'pdf') {
    const stamped = await stampPdf(await blob.arrayBuffer());
    return saveBlob(new Blob([stamped as BlobPart], { type: 'application/pdf' }), fileName);
  }
  if (kind === 'image' && /\.(png|jpe?g)$/i.test(fileName)) return saveBlob(await stampImage(blob), fileName);
  return saveBlob(blob, fileName);
}
