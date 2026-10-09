/**
 * The syllabus as a downloadable PDF, drawn in the browser with pdf-lib: the whole course structure
 * (every semester's table) from /syllabus, or one semester with its course details from
 * /syllabus/semester-N. Follows the curriculum switch, like the page itself.
 */
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib';
import { syllabusCode, syllabusLink, syllabusPath, syllabusSemesters, type Semester2025 } from '@/content/curriculum2025';
import { subjectPath } from '@/content/notes';
import { STRUCTURE_LABELS, type Structure } from '@/content/structure';
import { SITE_HOST, SITE_URL } from '@/content/watermark';
import { withBase } from '@/content/router';
import { fit, safe, wrap } from '@/content/pdfText';

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 44;
const NOTE =
  'Compiled by BECE Vault from the BE Computer Engineering curriculum published by Pokhara University. This copy is not ' +
  'issued or endorsed by Pokhara University; check with your college or pu.edu.np for the latest official syllabus.';

const credits = (s: Semester2025) => s.courses.reduce((a, c) => a + c.credits, 0);

export const syllabusFileName = (structure: Structure, semesterId?: number) =>
  `BECE-Vault-Syllabus-${semesterId ? `Semester-${semesterId}-` : ''}${structure === '2025' ? '2025-batch-onwards' : 'before-2025-batch'}.pdf`;

export async function createSyllabusPdf(structure: Structure, semesterId?: number): Promise<Uint8Array> {
  const all = syllabusSemesters(structure);
  const only = semesterId ? all.find((s) => s.id === semesterId) : undefined;
  const sems = only ? [only] : all;
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
    link: rgb(0.12, 0.48, 0.35),
  };

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  // "BECE Vault" in Cinzel, the site's brand font; Helvetica Bold if it can't be loaded.
  const brand: PDFFont = await Promise.all([import('@pdf-lib/fontkit'), fetch(withBase('/fonts/Cinzel-Bold.ttf'))])
    .then(async ([fontkit, res]) => {
      if (!res.ok) throw new Error('font');
      pdf.registerFontkit(fontkit.default);
      return pdf.embedFont(await res.arrayBuffer(), { subset: true });
    })
    .catch(() => bold);
  // Both logos are optional: the PDF still works if either can't be fetched.
  const png = (path: string) => fetch(withBase(path))
    .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(path))))
    .then((bytes) => pdf.embedPng(bytes))
    .catch(() => null);
  const [puLogo, siteLogo] = await Promise.all([png('/images/pokhara-university-logo.png'), png('/images/logo.png')]);
  const sized = (img: PDFImage | null, height: number) => (img ? { width: (img.width / img.height) * height, height } : { width: 0, height: 0 });

  const contentWidth = A4.width - MARGIN * 2;
  const generated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  let page: PDFPage = pdf.addPage([A4.width, A4.height]);
  let y = A4.height;

  const addLink = (x: number, yy: number, width: number, height: number, url: string) => {
    const link = pdf.context.register(pdf.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x - 1, yy - 2, x + width + 1, yy + height + 1],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    }));
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (annots) annots.push(link);
    else page.node.set(PDFName.of('Annots'), pdf.context.obj([link]));
  };
  const text = (t: string, x: number, yy: number, size: number, font = regular, color = C.body) =>
    page.drawText(safe(t), { x, y: yy, size, font, color });
  const right = (t: string, xRight: number, yy: number, size: number, font = regular, color = C.body) =>
    text(t, xRight - font.widthOfTextAtSize(safe(t), size), yy, size, font, color);
  /** Underlined, clickable text; returns its width. */
  const linkText = (t: string, x: number, yy: number, size: number, url: string) => {
    const w = regular.widthOfTextAtSize(safe(t), size);
    text(t, x, yy, size, regular, C.link);
    page.drawLine({ start: { x, y: yy - 1.2 }, end: { x: x + w, y: yy - 1.2 }, thickness: 0.4, color: C.link, opacity: 0.6 });
    addLink(x, yy, w, size, url);
    return w;
  };

  /** Pokhara University on the left, BECE Vault on the right, both clickable. */
  const letterhead = (height: number, top: number) => {
    const pu = sized(puLogo, height);
    if (puLogo) {
      page.drawImage(puLogo, { x: MARGIN, y: top - height, ...pu });
      addLink(MARGIN, top - height, pu.width, height, 'https://pu.edu.np');
    } else text('Pokhara University', MARGIN, top - height / 2 - 4, height * 0.32, bold, C.ink);
    const site = sized(siteLogo, height * 0.8);
    const brandSize = height * 0.36;
    const brandWidth = brand.widthOfTextAtSize('BECE Vault', brandSize);
    const brandX = A4.width - MARGIN - brandWidth;
    if (siteLogo) page.drawImage(siteLogo, { x: brandX - site.width - 8, y: top - height * 0.9, ...site });
    text('BECE Vault', brandX, top - height * 0.5, brandSize, brand, C.goldDeep);
    if (height > 30) right(SITE_HOST, A4.width - MARGIN, top - height * 0.5 - 13, 7.5, regular, C.muted);
    addLink(brandX - site.width - 8, top - height * 0.9, site.width + 8 + brandWidth, height * 0.8, SITE_URL);
    page.drawRectangle({ x: MARGIN, y: top - height - 12, width: contentWidth, height: 1.6, color: C.gold });
  };

  const newPage = () => {
    page = pdf.addPage([A4.width, A4.height]);
    letterhead(26, A4.height - 22);
    y = A4.height - 84;
  };
  const ensure = (height: number) => {
    if (y - height < 70) newPage();
  };

  /* Letterhead and title */
  letterhead(48, A4.height - 30);
  y = A4.height - 120;
  text(`POKHARA UNIVERSITY  ·  BE COMPUTER ENGINEERING${only ? `  ·  ${only.year.toUpperCase()}` : ''}`, MARGIN, y, 8, bold, C.goldDeep);
  y -= 24;
  text(only ? `${only.label} Syllabus` : 'Course Structure & Syllabus', MARGIN, y, 21, bold, C.ink);
  y -= 18;
  const totalCredits = all.reduce((a, s) => a + credits(s), 0);
  text(only
    ? `Curriculum: ${STRUCTURE_LABELS[structure]}  ·  ${only.courses.length} courses  ·  ${credits(only)} credits  ·  Generated ${generated}`
    : `Curriculum: ${STRUCTURE_LABELS[structure]}  ·  8 semesters  ·  ${totalCredits} credits  ·  Generated ${generated}`,
  MARGIN, y, 9, regular, C.muted);
  y -= 22;

  /* Unofficial-copy note */
  const noteLines = wrap(NOTE, regular, 8.5, contentWidth - 28);
  const noteHeight = 26 + noteLines.length * 11.5;
  page.drawRectangle({ x: MARGIN, y: y - noteHeight, width: contentWidth, height: noteHeight, color: C.cream, borderColor: C.gold, borderWidth: 0.8 });
  page.drawRectangle({ x: MARGIN, y: y - noteHeight, width: 3.5, height: noteHeight, color: C.goldDeep });
  text('UNOFFICIAL COPY  ·  FOR STUDY REFERENCE', MARGIN + 14, y - 15, 8.5, bold, C.goldDeep);
  noteLines.forEach((line, i) => text(line, MARGIN + 14, y - 28 - i * 11.5, 8.5, regular, C.body));
  y -= noteHeight + 26;

  /* One table per semester */
  const col = { code: MARGIN + 10, name: MARGIN + 82, credits: MARGIN + contentWidth - 10 };
  const ROW = 18;
  const row = (cells: [string, string, string], kind: 'head' | 'course' | 'total') => {
    const fill = kind === 'head' ? C.soft : kind === 'total' ? C.cream : undefined;
    if (fill) page.drawRectangle({ x: MARGIN, y: y - ROW, width: contentWidth, height: ROW, color: fill });
    const font = kind === 'course' ? regular : bold;
    const size = kind === 'head' ? 7.5 : 9;
    const color = kind === 'head' ? C.muted : kind === 'total' ? C.ink : C.body;
    const yy = y - 12.5;
    text(cells[0], col.code, yy, kind === 'head' ? 7.5 : 8.5, bold, kind === 'head' || cells[0] === '—' ? C.muted : C.ink);
    text(fit(cells[1], font, size, col.credits - col.name - 60), col.name, yy, size, font, color);
    right(cells[2], col.credits, yy, size, font, color);
    y -= ROW;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + contentWidth, y }, thickness: 0.5, color: C.line });
  };

  for (const sem of sems) {
    ensure(48 + (sem.courses.length + 2) * ROW);
    if (!only) {
      text(sem.label, MARGIN, y, 13, bold, C.ink);
      right(`${sem.year}  ·  ${sem.courses.length} courses  ·  ${credits(sem)} credits`, MARGIN + contentWidth, y, 8.5, regular, C.muted);
      y -= 10;
    }
    row(['CODE', 'COURSE', 'CREDITS'], 'head');
    for (const c of sem.courses) row([syllabusCode(c.code), c.name, String(c.credits)], 'course');
    row(['', 'Total', String(credits(sem))], 'total');
    y -= 26;
  }

  if (!only) {
    ensure(40);
    text(`Total for the programme: ${totalCredits} credits over 8 semesters (4 years; up to 8 years allowed).`, MARGIN, y, 9.5, bold, C.ink);
    y -= 30;
  }

  /* One semester: what each course covers, with links to its notes */
  if (only) {
    ensure(70);
    text('Courses in detail', MARGIN, y, 13, bold, C.ink);
    y -= 22;
    for (const c of only.courses) {
      const elective = c.subject?.electiveSlot;
      const about = elective
        ? 'Choose one elective offered by your college. Notes for the electives are in the Electives collection.'
        : c.subject?.description ?? 'Course details will be added soon.';
      const lines = wrap(about, regular, 9, contentWidth - 14);
      ensure(48 + lines.length * 12.5);
      page.drawRectangle({ x: MARGIN, y: y - 4 - (36 + lines.length * 12.5), width: 2.5, height: 36 + lines.length * 12.5, color: C.gold });
      text(fit(c.name, bold, 11, contentWidth - 200), MARGIN + 12, y - 8, 11, bold, C.ink);
      right(`${elective ? 'Elective' : c.code}  ·  ${c.credits} credits`, MARGIN + contentWidth, y - 8, 8, regular, C.muted);
      y -= 24;
      lines.forEach((line) => {
        text(line, MARGIN + 12, y, 9, regular, C.body);
        y -= 12.5;
      });
      y -= 2;
      let lx = MARGIN + 12;
      const notes = elective ? '/electives' : c.subject && c.noteSemester ? subjectPath(c.noteSemester, c.subject) : null;
      if (notes) lx += linkText(elective ? 'Browse electives' : `Notes (${c.subject!.files.length} files)`, lx, y, 8.5, SITE_URL + notes) + 16;
      const pdfPath = syllabusLink(c);
      if (pdfPath) linkText('Detailed syllabus', lx, y, 8.5, SITE_URL + pdfPath);
      y -= 24;
    }
  }

  /* Footer on every page (no watermark: the logo is already in the letterhead) */
  const pages = pdf.getPages();
  const pageUrl = `${SITE_HOST}${syllabusPath(only?.id)}`;
  pages.forEach((p, i) => {
    page = p;
    p.drawLine({ start: { x: MARGIN, y: 44 }, end: { x: A4.width - MARGIN, y: 44 }, thickness: 0.5, color: C.line });
    const lead = 'Syllabus from ';
    text(lead, MARGIN, 30, 7.5, regular, C.muted);
    const w = linkText(pageUrl, MARGIN + regular.widthOfTextAtSize(lead, 7.5), 30, 7.5, `https://${pageUrl}`);
    text('  ·  Unofficial copy, check pu.edu.np for the official syllabus', MARGIN + regular.widthOfTextAtSize(lead, 7.5) + w, 30, 7.5, regular, C.muted);
    right(`Page ${i + 1} of ${pages.length}`, A4.width - MARGIN, 30, 7.5, regular, C.muted);
  });

  pdf.setTitle(`${only ? `${only.label} Syllabus` : 'BE Computer Engineering Syllabus'} | Pokhara University | BECE Vault`);
  pdf.setAuthor('BECE Vault');
  pdf.setSubject(`Pokhara University BE Computer Engineering syllabus (${STRUCTURE_LABELS[structure]}), from ${pageUrl}. Unofficial copy.`);
  pdf.setCreator('BECE Vault');
  pdf.setProducer(`BECE Vault (${SITE_HOST})`);
  pdf.setCreationDate(new Date());
  return pdf.save();
}
