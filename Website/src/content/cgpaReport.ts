/**
 * The CGPA calculator's PDF report. The PDF is drawn in the browser with pdf-lib, and the exact
 * grades are also stored inside it (in the PDF's keywords), so uploading the report later fills
 * the calculator back in. Only reports made here carry that data, so other PDFs are refused.
 */
import type { PDFFont, PDFPage } from 'pdf-lib';
import { DISTINCTION_CGPA, MIN_CGPA, formatGpa, gradePoint } from '@/content/grades';
import { cleanEntries, computeResults, curriculumFor, emptyEntry, isElectiveSlot, type Entries } from '@/content/cgpa';
import { STRUCTURE_LABELS, type Structure } from '@/content/structure';
import { SITE_HOST, SITE_URL } from '@/content/watermark';
import { withBase } from '@/content/router';

const CREATOR = 'BECE Vault CGPA Calculator';
const MARKER = 'BECEVaultCGPA';
const VERSION = 1;
const PAGE_URL = `${SITE_HOST}/cgpa-calculator`;
export const DISCLAIMER =
  `Generated at ${PAGE_URL} entirely from grades and SGPAs entered by the user. BECE Vault has not verified this ` +
  'information and does not guarantee its accuracy or authenticity. This is an unofficial estimate, not a transcript ' +
  'or marksheet, and must not be used for admission, employment, scholarships, visas or any other official purpose. ' +
  'Your Pokhara University transcript is the only official record.';

interface Payload {
  v: number;
  generated: string;
  /** Which curriculum order the grades follow (missing in older reports = the earlier order). */
  structure?: Structure;
  entries: Entries;
}

/* ------------------------------ encoding ------------------------------ */

/** Short checksum so an edited or damaged report is noticed. Not security, just a sanity check. */
function checksum(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64 = (text: string) => {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/* ------------------------------ drawing ------------------------------ */

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 44;

/** Helvetica only covers Latin characters; anything else (e.g. in a typed elective name) becomes "?". */
const safe = (text: string) => text.replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '?');

function wrap(text: string, font: PDFFont, size: number, width: number) {
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

function fit(text: string, font: PDFFont, size: number, width: number) {
  let t = safe(text);
  if (font.widthOfTextAtSize(t, size) <= width) return t;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}


export async function createReport(entries: Entries, structure: Structure = 'pre2025'): Promise<Uint8Array> {
  const sems = curriculumFor(structure);
  const { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, rgb } = await import('pdf-lib');
  const C = {
    ink: rgb(0.043, 0.122, 0.102),
    body: rgb(0.16, 0.25, 0.22),
    muted: rgb(0.43, 0.49, 0.46),
    line: rgb(0.87, 0.89, 0.86),
    soft: rgb(0.965, 0.97, 0.945),
    gold: rgb(0.94, 0.765, 0.29),
    goldDeep: rgb(0.72, 0.525, 0.043),
    cream: rgb(1, 0.973, 0.882),
    green: rgb(0.059, 0.165, 0.133),
    red: rgb(0.745, 0.29, 0.212),
    white: rgb(1, 1, 1),
    link: rgb(0.12, 0.48, 0.35),
  };

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  // The "BECE Vault" wordmark in Cinzel, the site's brand font; Helvetica Bold if it can't be loaded.
  const brand = await Promise.all([import('@pdf-lib/fontkit'), fetch(withBase('/fonts/Cinzel-Bold.ttf'))])
    .then(async ([fontkit, res]) => {
      if (!res.ok) throw new Error('font');
      pdf.registerFontkit(fontkit.default);
      return pdf.embedFont(await res.arrayBuffer(), { subset: true });
    })
    .catch(() => bold);
  const summary = computeResults(entries, sems);
  const generated = new Date();
  const payloadJson = JSON.stringify({ v: VERSION, generated: generated.toISOString(), structure, entries: cleanEntries(entries, sems) } satisfies Payload);
  const reportId = checksum(payloadJson).toUpperCase();
  const when = generated.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const contentWidth = A4.width - MARGIN * 2;

  // The site logo, if it can be fetched; the report still works without it.
  const logo = await fetch(withBase('/images/logo.png'))
    .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('logo'))))
    .then((bytes) => pdf.embedPng(bytes))
    .catch(() => null);
  const logoSize = (height: number) => (logo ? { width: (logo.width / logo.height) * height, height } : { width: 0, height: 0 });

  let page: PDFPage = pdf.addPage([A4.width, A4.height]);
  let y = A4.height;

  const addLink = (target: PDFPage, x: number, yy: number, width: number, size: number, url: string) => {
    const link = pdf.context.register(pdf.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x - 1, yy - 2, x + width + 1, yy + size + 1],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    }));
    const annots = target.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (annots) annots.push(link);
    else target.node.set(PDFName.of('Annots'), pdf.context.obj([link]));
  };
  /** Draws a line of text; if it mentions `linkText`, that part is coloured, underlined and clickable. */
  const textWithLink = (target: PDFPage, line: string, x: number, yy: number, size: number, color: ReturnType<typeof rgb>, linkText: string, url: string) => {
    const at = line.indexOf(linkText);
    if (at < 0) return target.drawText(safe(line), { x, y: yy, size, font: regular, color });
    const before = safe(line.slice(0, at));
    const after = safe(line.slice(at + linkText.length));
    const lx = x + regular.widthOfTextAtSize(before, size);
    const lw = regular.widthOfTextAtSize(linkText, size);
    if (before) target.drawText(before, { x, y: yy, size, font: regular, color });
    target.drawText(linkText, { x: lx, y: yy, size, font: regular, color: C.link });
    target.drawLine({ start: { x: lx, y: yy - 1.2 }, end: { x: lx + lw, y: yy - 1.2 }, thickness: 0.4, color: C.link, opacity: 0.6 });
    if (after) target.drawText(after, { x: lx + lw, y: yy, size, font: regular, color });
    addLink(target, lx, yy, lw, size, url);
  };

  /** Draws wrapped lines justified to `width` (the last line stays left-aligned); `linkText` stays a link. */
  const justified = (target: PDFPage, lines: string[], x: number, top: number, width: number, size: number, leading: number, color: ReturnType<typeof rgb>, linkText: string, url: string) => {
    const space = regular.widthOfTextAtSize(' ', size);
    lines.forEach((line, i) => {
      const yy = top - i * leading;
      const words = line.split(' ');
      const widths = words.map((w) => regular.widthOfTextAtSize(w, size));
      const last = i === lines.length - 1 || words.length < 2;
      const gap = last ? space : (width - widths.reduce((a, b) => a + b, 0)) / (words.length - 1);
      let cx = x;
      words.forEach((word, w) => {
        const isLink = word === linkText;
        target.drawText(word, { x: cx, y: yy, size, font: regular, color: isLink ? C.link : color });
        if (isLink) {
          target.drawLine({ start: { x: cx, y: yy - 1.2 }, end: { x: cx + widths[w], y: yy - 1.2 }, thickness: 0.4, color: C.link, opacity: 0.6 });
          addLink(target, cx, yy, widths[w], size, url);
        }
        cx += widths[w] + gap;
      });
    });
  };

  const text = (t: string, x: number, yy: number, size: number, font = regular, color = C.body) =>
    page.drawText(safe(t), { x, y: yy, size, font, color });
  const right = (t: string, xRight: number, yy: number, size: number, font = regular, color = C.body) =>
    text(t, xRight - font.widthOfTextAtSize(safe(t), size), yy, size, font, color);

  // Continuation pages start with a slim header.
  const newPage = () => {
    page = pdf.addPage([A4.width, A4.height]);
    page.drawRectangle({ x: 0, y: A4.height - 34, width: A4.width, height: 34, color: C.green });
    const small = logoSize(20);
    if (logo) page.drawImage(logo, { x: MARGIN, y: A4.height - 27, ...small });
    text('BECE Vault', MARGIN + (logo ? small.width + 6 : 0), A4.height - 22, 11, brand, C.gold);
    addLink(page, MARGIN, A4.height - 27, (logo ? small.width + 6 : 0) + brand.widthOfTextAtSize('BECE Vault', 11), 20, SITE_URL);
    right('CGPA Report (continued)', A4.width - MARGIN, A4.height - 22, 9, regular, C.white);
    y = A4.height - 60;
  };
  const ensure = (height: number) => {
    if (y - height < 70) newPage();
  };

  /* Header band */
  page.drawRectangle({ x: 0, y: A4.height - 96, width: A4.width, height: 96, color: C.green });
  page.drawRectangle({ x: 0, y: A4.height - 99, width: A4.width, height: 3, color: C.gold });
  const big = logoSize(56);
  if (logo) page.drawImage(logo, { x: MARGIN, y: A4.height - 82, ...big });
  const tx = MARGIN + (logo ? big.width + 12 : 0);
  text('BECE Vault', tx, A4.height - 44, 22, brand, C.gold);
  if (logo) addLink(page, MARGIN, A4.height - 82, big.width, big.height, SITE_URL);
  addLink(page, tx, A4.height - 46, brand.widthOfTextAtSize('BECE Vault', 22), 20, SITE_URL);
  text('CGPA Report  ·  Pokhara University  ·  BE Computer Engineering', tx, A4.height - 64, 10, regular, C.white);
  text(PAGE_URL, tx, A4.height - 80, 8.5, regular, rgb(0.62, 0.72, 0.68));
  addLink(page, tx, A4.height - 80, regular.widthOfTextAtSize(PAGE_URL, 8.5), 8.5, `https://${PAGE_URL}`);
  right(`Generated ${when}`, A4.width - MARGIN, A4.height - 44, 9, regular, C.white);
  right(`Report ID ${reportId}`, A4.width - MARGIN, A4.height - 58, 8.5, regular, rgb(0.62, 0.72, 0.68));
  right(`Curriculum: ${STRUCTURE_LABELS[structure]}`, A4.width - MARGIN, A4.height - 72, 8.5, regular, rgb(0.62, 0.72, 0.68));
  y = A4.height - 122;

  /* Disclaimer */
  const noteLines = wrap(DISCLAIMER, regular, 8.5, contentWidth - 28);
  const noteHeight = 26 + noteLines.length * 11.5;
  page.drawRectangle({ x: MARGIN, y: y - noteHeight, width: contentWidth, height: noteHeight, color: C.cream, borderColor: C.gold, borderWidth: 0.8 });
  page.drawRectangle({ x: MARGIN, y: y - noteHeight, width: 3.5, height: noteHeight, color: C.goldDeep });
  text('NOT AN OFFICIAL DOCUMENT  ·  BASED ON USER INPUT', MARGIN + 14, y - 15, 8.5, bold, C.goldDeep);
  justified(page, noteLines, MARGIN + 14, y - 28, contentWidth - 28, 8.5, 11.5, C.body, PAGE_URL, `https://${PAGE_URL}`);
  y -= noteHeight + 22;

  /* Summary: the CGPA, then the key numbers */
  const boxH = 92;
  page.drawRectangle({ x: MARGIN, y: y - boxH, width: 170, height: boxH, color: C.green });
  text('CUMULATIVE GPA', MARGIN + 16, y - 20, 8, bold, C.gold);
  text(formatGpa(summary.cgpa), MARGIN + 16, y - 62, 40, bold, C.white);
  text('out of 4.00', MARGIN + 16, y - 80, 8.5, regular, rgb(0.62, 0.72, 0.68));

  const standing = summary.cgpa === null ? 'No grades entered'
    : summary.cgpa >= DISTINCTION_CGPA ? 'Distinction level'
    : summary.cgpa >= MIN_CGPA ? `Above the ${MIN_CGPA.toFixed(1)} minimum CGPA`
    : `Below the ${MIN_CGPA.toFixed(1)} minimum CGPA`;
  const stats: [string, string][] = [
    ['Credits counted', `${summary.earned} / ${summary.programCredits}`],
    ['Semesters entered', `${summary.counted.length} / ${sems.length}`],
    ['Best SGPA', formatGpa(summary.best)],
    ['Standing', standing],
  ];
  const sx = MARGIN + 190;
  stats.forEach(([label, value], i) => {
    const yy = y - 16 - i * 21;
    text(label.toUpperCase(), sx, yy, 7.5, bold, C.muted);
    text(value, sx + 110, yy, 10.5, bold, i === 3 && summary.cgpa !== null && summary.cgpa < MIN_CGPA ? C.red : C.ink);
  });
  y -= boxH + 30;

  /* Semester overview */
  const col = { sem: MARGIN + 10, credits: MARGIN + contentWidth - 130, sgpa: MARGIN + contentWidth - 10 };
  const tableHeader = (labels: [string, number, boolean?][]) => {
    page.drawRectangle({ x: MARGIN, y: y - 20, width: contentWidth, height: 20, color: C.soft });
    for (const [label, x, alignRight] of labels) {
      if (alignRight) right(label, x, y - 13.5, 7.5, bold, C.muted);
      else text(label, x, y - 13.5, 7.5, bold, C.muted);
    }
    y -= 20;
  };
  const rowLine = () => page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + contentWidth, y }, thickness: 0.5, color: C.line });

  text('Semester overview', MARGIN, y, 13, bold, C.ink);
  y -= 12;
  tableHeader([['SEMESTER', col.sem], ['CREDITS', col.credits, true], ['SGPA', col.sgpa, true]]);
  sems.forEach((sem, i) => {
    const r = summary.results[i];
    const has = r.sgpa !== null;
    y -= 18;
    text(sem.label, col.sem, y + 5.5, 9.5, has ? bold : regular, has ? C.ink : C.muted);
    right(`${has ? r.credits : 0} / ${r.totalCredits}`, col.credits, y + 5.5, 9.5, regular, has ? C.body : C.muted);
    right(formatGpa(r.sgpa), col.sgpa, y + 5.5, 9.5, bold, has ? C.ink : C.muted);
    rowLine();
  });
  y -= 28;

  /* Subject grades for each semester that has them */
  const sub = { code: MARGIN + 10, name: MARGIN + 80, credits: MARGIN + 360, grade: MARGIN + 395, points: MARGIN + contentWidth - 10 };
  sems.forEach((sem, i) => {
    const entry = entries[sem.id] ?? emptyEntry();
    const graded = sem.courses.filter((c) => entry.grades[c.code]);
    if (!graded.length) return;
    const r = summary.results[i];
    ensure(60 + graded.length * 18);
    text(sem.label, MARGIN, y, 12, bold, C.ink);
    right(r.typed ? `Graded subjects: ${formatGpa(r.fromGrades)}  ·  counted SGPA (entered): ${formatGpa(r.sgpa)}` : `SGPA ${formatGpa(r.sgpa)}`,
      MARGIN + contentWidth, y, 9.5, bold, C.goldDeep);
    y -= 10;
    tableHeader([['CODE', sub.code], ['SUBJECT', sub.name], ['CR.', sub.credits + 14, true], ['GRADE', sub.grade], ['POINTS', sub.points, true]]);
    for (const c of graded) {
      const grade = entry.grades[c.code];
      const point = gradePoint(grade) ?? 0;
      const name = isElectiveSlot(c.code) && entry.electives[c.code] ? `${c.name}: ${entry.electives[c.code]}` : c.name;
      y -= 18;
      text(c.code, sub.code, y + 5.5, 8.5, bold, C.ink);
      text(fit(name, regular, 9, sub.credits - sub.name - 16), sub.name, y + 5.5, 9, regular, C.body);
      right(String(c.credits), sub.credits + 14, y + 5.5, 9, regular, C.body);
      text(`${grade} (${point.toFixed(1)})`, sub.grade, y + 5.5, 9, bold, grade === 'F' ? C.red : C.ink);
      right((point * c.credits).toFixed(1), sub.points, y + 5.5, 9, regular, C.body);
      rowLine();
    }
    y -= 26;
  });

  /* How it's worked out */
  ensure(60);
  text('How this is calculated', MARGIN, y, 10, bold, C.ink);
  y -= 14;
  for (const line of wrap(
    'SGPA = sum of (credit x grade point) / sum of credits for one semester; CGPA uses every entered semester together. ' +
    'Grade points follow the Pokhara University scale (A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, F = 0.0). ' +
    'An SGPA entered directly counts over all of that semester\'s credits.',
    regular, 8.5, contentWidth,
  )) {
    text(line, MARGIN, y, 8.5, regular, C.muted);
    y -= 11.5;
  }

  /* Footer on every page */
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGIN, y: 44 }, end: { x: A4.width - MARGIN, y: 44 }, thickness: 0.5, color: C.line });
    textWithLink(p, `Generated from ${SITE_HOST}  ·  Based on user input  ·  Unofficial estimate, not valid for official use`, MARGIN, 30, 7.5, C.muted, SITE_HOST, `https://${SITE_HOST}`);
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: A4.width - MARGIN - regular.widthOfTextAtSize(label, 7.5), y: 30, size: 7.5, font: regular, color: C.muted });
  });

  pdf.setTitle('CGPA Report | BECE Vault');
  pdf.setAuthor('BECE Vault user');
  pdf.setSubject(`Unofficial CGPA estimate generated at ${PAGE_URL} from user input.`);
  pdf.setCreator(CREATOR);
  pdf.setProducer(`${CREATOR} (${SITE_HOST})`);
  pdf.setCreationDate(generated);
  pdf.setKeywords([`${MARKER}:${VERSION}:${toBase64(payloadJson)}:${checksum(payloadJson)}`]);
  return pdf.save();
}

export class ReportError extends Error {}

const NOT_OURS = 'Only CGPA reports downloaded from this calculator can be uploaded. This PDF wasn’t made here.';

/** Reads a report made by createReport and returns its grades; throws ReportError for anything else. */
export async function readReport(file: File): Promise<{ entries: Entries; generated: Date | null; structure: Structure }> {
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw new ReportError('Please choose a PDF file.');
  if (file.size > 5 * 1024 * 1024) throw new ReportError('This PDF is too large to be a BECE Vault CGPA report.');
  const { PDFDocument } = await import('pdf-lib');
  let keywords: string | undefined;
  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
    keywords = pdf.getKeywords();
  } catch {
    // Protected, damaged or unusual PDFs: none of them can be one of our reports.
    throw new ReportError(NOT_OURS);
  }
  const token = keywords?.split(/\s+/).find((k) => k.startsWith(`${MARKER}:`));
  if (!token) throw new ReportError(NOT_OURS);
  const [, version, data, sum] = token.split(':');
  let json: string;
  try {
    json = fromBase64(data);
  } catch {
    throw new ReportError('This report is damaged and could not be read.');
  }
  if (checksum(json) !== sum) throw new ReportError('This report has been changed or damaged, so it can’t be loaded.');
  if (Number(version) > VERSION) throw new ReportError('This report was made by a newer version of the calculator. Refresh the page and try again.');
  const payload = JSON.parse(json) as Partial<Payload>;
  const generated = payload.generated ? new Date(payload.generated) : null;
  const structure: Structure = payload.structure === '2025' ? '2025' : 'pre2025';
  return {
    entries: cleanEntries(payload.entries, curriculumFor(structure)),
    generated: generated && !isNaN(generated.getTime()) ? generated : null,
    structure,
  };
}

export const reportFileName = () => `BECE-Vault-CGPA-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

