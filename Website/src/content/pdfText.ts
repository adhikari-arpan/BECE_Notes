/** Text helpers shared by the PDFs drawn in the browser with pdf-lib (CGPA report, syllabus). */
import type { PDFFont } from 'pdf-lib';

/** Helvetica only covers Latin characters; anything else (e.g. in a typed elective name) becomes "?". */
export const safe = (text: string) => text.replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '?');

/** Splits text into lines no wider than `width`. */
export function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of safe(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Shortens text with "…" so it fits in `width`. */
export function fit(text: string, font: PDFFont, size: number, width: number) {
  let t = safe(text);
  if (font.widthOfTextAtSize(t, size) <= width) return t;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}
