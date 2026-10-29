/**
 * The sponsor pitch as a PDF (the "Download pitch" button on /analytics), drawn in the browser with
 * pdf-lib from the same live counters as the page: two A4 pages a company can read on its own,
 * not a printout of the dashboard.
 *   Page 1: who BECE Vault reaches, the headline numbers and the last 30 days.
 *   Page 2: why sponsor, the sponsor spots, how the numbers can be checked, contact.
 */
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib';
import type { AnalyticsData, DayCount, Row } from '@/content/analytics';
import { rawCounterUrl } from '@/content/analytics';
import { COUNTING_SINCE } from '@/content/visits';
import { SITE_HOST, SITE_URL } from '@/content/watermark';
import { withBase } from '@/content/router';
import { safe, wrap } from '@/content/pdfText';

const A4 = { width: 595.28, height: 841.89 };
const M = 46;
const W = A4.width - M * 2;
const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';
const REPO_URL = 'https://github.com/adhikari-arpan/BECE_Notes';

export interface PitchLibrary { files: number; papers: number; subjects: number; guides: number; contributors: number }

export const pitchFileName = () => `BECE-Vault-Sponsorship-${new Date().toISOString().slice(0, 10)}.pdf`;

const fmt = (n: number, digits = 0) => n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const sum = (days: DayCount[], key: 'visitors' | 'pageViews') => days.reduce((t, d) => t + d[key], 0);
const dayLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const niceTop = (max: number) => {
  if (max <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(max));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((v) => v >= max) ?? max;
};
const share = (rows: Row[]) => {
  const total = rows.reduce((t, r) => t + r.value, 0);
  return rows.filter((r) => r.value > 0).map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) }));
};

export async function createPitchPdf(data: AnalyticsData, library: PitchLibrary): Promise<Uint8Array> {
  const { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, rgb } = await import('pdf-lib');
  const C = {
    ink: rgb(0.043, 0.122, 0.102),
    body: rgb(0.2, 0.27, 0.24),
    muted: rgb(0.43, 0.49, 0.46),
    line: rgb(0.87, 0.89, 0.86),
    soft: rgb(0.965, 0.97, 0.945),
    gold: rgb(0.94, 0.765, 0.29),
    goldDeep: rgb(0.72, 0.525, 0.043),
    cream: rgb(1, 0.973, 0.882),
    green: rgb(0.059, 0.165, 0.133),
    greenMid: rgb(0.09, 0.247, 0.216),
    onGreen: rgb(0.973, 0.957, 0.914),
    onGreenMuted: rgb(0.74, 0.8, 0.77),
    link: rgb(0.12, 0.48, 0.35),
    white: rgb(1, 1, 1),
  };

  const pdf = await PDFDocument.create();
  pdf.setTitle('BECE Vault: sponsorship and audience');
  pdf.setAuthor('Arpan Adhikari, BECE Vault');
  pdf.setSubject(`Audience numbers for ${SITE_HOST}`);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const brand: PDFFont = await Promise.all([import('@pdf-lib/fontkit'), fetch(withBase('/fonts/Cinzel-Bold.ttf'))])
    .then(async ([fontkit, res]) => {
      if (!res.ok) throw new Error('font');
      pdf.registerFontkit(fontkit.default);
      return pdf.embedFont(await res.arrayBuffer(), { subset: true });
    })
    .catch(() => bold);
  const logo: PDFImage | null = await fetch(withBase('/images/logo.png'))
    .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('logo'))))
    .then((bytes) => pdf.embedPng(bytes))
    .catch(() => null);

  // The numbers (the same ones the page shows).
  const { daily } = data;
  const last30 = daily.slice(-30);
  const v30 = sum(last30, 'visitors');
  const p30 = sum(last30, 'pageViews');
  const avg = last30.length ? v30 / last30.length : 0;
  const ppv = data.visitors ? data.pageViews / data.visitors : 0;
  const busiest = daily.reduce<DayCount | null>((b, d) => (!b || d.visitors > b.visitors ? d : b), null);
  const spike = busiest && avg ? busiest.visitors / avg : 0;
  const asOf = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  let page: PDFPage = pdf.addPage([A4.width, A4.height]);
  const pages: PDFPage[] = [page];

  const text = (t: string, x: number, y: number, size: number, font = regular, color = C.body) => page.drawText(safe(t), { x, y, size, font, color });
  const width = (t: string, size: number, font = regular) => font.widthOfTextAtSize(safe(t), size);
  const para = (t: string, x: number, y: number, w: number, size: number, color = C.body, font = regular, lead = 1.45) => {
    const lines = wrap(t, font, size, w);
    lines.forEach((l, i) => text(l, x, y - i * size * lead, size, font, color));
    return y - lines.length * size * lead;
  };
  const addLink = (x: number, y: number, w: number, h: number, url: string) => {
    const link = pdf.context.register(pdf.context.obj({
      Type: 'Annot', Subtype: 'Link', Rect: [x - 1, y - 2, x + w + 1, y + h + 1], Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    }));
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (annots) annots.push(link);
    else page.node.set(PDFName.of('Annots'), pdf.context.obj([link]));
  };
  const linkText = (t: string, x: number, y: number, size: number, url: string, font = regular) => {
    const w = width(t, size, font);
    text(t, x, y, size, font, C.link);
    page.drawLine({ start: { x, y: y - 1.3 }, end: { x: x + w, y: y - 1.3 }, thickness: 0.4, color: C.link, opacity: 0.6 });
    addLink(x, y, w, size, url);
    return w;
  };
  const kicker = (t: string, x: number, y: number, color = C.goldDeep) => text(t.toUpperCase(), x, y, 7.5, bold, color);
  const heading = (t: string, x: number, y: number, size = 15) => text(t, x, y, size, bold, C.ink);
  const brandMark = (x: number, y: number, size: number, color = C.gold) => {
    const h = size * 1.7;
    if (logo) page.drawImage(logo, { x, y: y - h * 0.28, width: (logo.width / logo.height) * h, height: h });
    const lx = logo ? x + (logo.width / logo.height) * h + 8 : x;
    text('BECE Vault', lx, y, size, brand, color);
    return lx + width('BECE Vault', size, brand);
  };

  /* ---------------- Page 1 ---------------- */
  // Cover band
  const bandH = 238;
  page.drawRectangle({ x: 0, y: A4.height - bandH, width: A4.width, height: bandH, color: C.green });
  page.drawRectangle({ x: 0, y: A4.height - bandH, width: A4.width, height: 3, color: C.gold });
  let y = A4.height - 54;
  const end = brandMark(M, y, 17);
  addLink(M, y - 8, end - M, 26, SITE_URL);
  const asOfText = `Live data · ${asOf}`;
  text(asOfText, A4.width - M - width(asOfText, 8.5), y + 2, 8.5, regular, C.onGreenMuted);
  y -= 46;
  kicker('Sponsorship & audience', M, y, C.gold);
  y -= 30;
  text('Reach Pokhara University', M, y, 27, bold, C.onGreen);
  y -= 32;
  text('engineering students where they study', M, y, 27, bold, C.gold);
  y -= 26;
  para(
    `BECE Vault (${SITE_HOST}) is the free notes library for Pokhara University BE Computer Engineering students: notes, past exam papers, syllabus, study guides and a CGPA calculator for all 8 semesters.`,
    M, y, W - 40, 10.5, C.onGreenMuted,
  );

  // Headline numbers
  y = A4.height - bandH - 30;
  kicker('The numbers', M, y);
  y -= 12;
  const tiles = [
    { value: fmt(data.visitors), label: 'Visitors', note: `since ${COUNTING_SINCE}` },
    { value: fmt(data.pageViews), label: 'Page visits', note: `${fmt(ppv, 1)} pages per visit` },
    { value: fmt(v30), label: 'Visitors, 30 days', note: `${fmt(p30)} page visits` },
    { value: fmt(avg), label: 'Visitors a day', note: 'average, last 30 days' },
  ];
  const gap = 10;
  const tw = (W - gap * 3) / 4;
  const th = 78;
  tiles.forEach((t, i) => {
    const x = M + i * (tw + gap);
    page.drawRectangle({ x, y: y - th, width: tw, height: th, color: i === 0 ? C.cream : C.soft, borderColor: i === 0 ? C.gold : C.line, borderWidth: 0.8 });
    text(t.value, x + 12, y - 34, 22, bold, C.ink);
    text(t.label, x + 12, y - 52, 9, bold, C.body);
    text(t.note, x + 12, y - 65, 7.5, regular, C.muted);
  });
  y -= th + 30;

  // Last 30 days chart
  heading('Daily visitors, last 30 days', M, y, 12);
  if (last30.length) {
    const range = `${dayLabel(last30[0].date)} – ${dayLabel(last30[last30.length - 1].date)} · Nepal time`;
    text(range, A4.width - M - width(range, 8), y + 1, 8, regular, C.muted);
  }
  y -= 16;
  const ch = 150;
  const cx = M + 26;
  const cw = W - 26;
  const vals = last30.map((d) => d.visitors);
  const top = niceTop(Math.max(1, ...vals));
  [0, 0.5, 1].forEach((f) => {
    const gy = y - ch + f * ch;
    page.drawLine({ start: { x: cx, y: gy }, end: { x: cx + cw, y: gy }, thickness: f === 0 ? 0.8 : 0.4, color: C.line });
    const lbl = fmt(top * f);
    text(lbl, cx - 6 - width(lbl, 7.5), gy - 2.5, 7.5, regular, C.muted);
  });
  if (vals.length > 1) {
    const px = (i: number) => (i / (vals.length - 1)) * cw;
    const py = (v: number) => (v / top) * ch; // measured down from the top of the plot in SVG terms
    const pts = vals.map((v, i) => `${px(i).toFixed(2)},${(ch - py(v)).toFixed(2)}`);
    page.drawSvgPath(`M0,${ch} L${pts.join(' L')} L${cw},${ch} Z`, { x: cx, y, color: C.gold, opacity: 0.18 });
    page.drawSvgPath(`M${pts.join(' L')}`, { x: cx, y, borderColor: C.goldDeep, borderWidth: 1.6 });
    const peak = vals.indexOf(Math.max(...vals));
    const label = `${fmt(vals[peak])} visitors · ${dayLabel(last30[peak].date)}`;
    const lx = Math.min(Math.max(cx + px(peak) - width(label, 7.5, bold) / 2, cx), cx + cw - width(label, 7.5, bold));
    page.drawCircle({ x: cx + px(peak), y: y - ch + py(vals[peak]), size: 2.6, color: C.goldDeep });
    text(label, lx, y - ch + py(vals[peak]) + 7, 7.5, bold, C.ink);
    [0, Math.floor((vals.length - 1) / 2), vals.length - 1].forEach((i, k) => {
      const l = dayLabel(last30[i].date);
      const lxx = k === 0 ? cx : k === 2 ? cx + cw - width(l, 7.5) : cx + px(i) - width(l, 7.5) / 2;
      text(l, lxx, y - ch - 13, 7.5, regular, C.muted);
    });
  }
  y -= ch + 38;

  // Audience and what's on the site
  const colW = (W - 20) / 2;
  const colTop = y;
  kicker('Who it reaches', M, y);
  let ly = y - 16;
  const audience = [
    'BE Computer Engineering students at Pokhara University’s affiliated colleges, from first semester to final year.',
    'Exam-season reach: students turn to BECE Vault before Pokhara University mid-terms and finals, when they need notes and past papers most.',
    spike >= 1.5 && busiest
      ? `Traffic surges when it matters: the busiest day so far had ${fmt(busiest.visitors)} visitors, about ${fmt(spike, 1)}× a normal day.`
      : 'Students return through the semester for notes, past papers and their CGPA.',
  ];
  audience.forEach((a) => {
    page.drawCircle({ x: M + 3, y: ly + 3, size: 2, color: C.gold });
    ly = para(a, M + 12, ly, colW - 12, 9.5) - 8;
  });

  const rx = M + colW + 20;
  kicker('What’s on the site', rx, colTop);
  const lib = [
    [fmt(library.files), 'note files'],
    [fmt(library.papers), 'past exam papers'],
    [String(library.guides), 'study guides'],
    [String(library.subjects), 'subjects with notes'],
  ];
  lib.forEach(([v, l], i) => {
    const bx = rx + (i % 2) * (colW / 2);
    const by = colTop - 34 - Math.floor(i / 2) * 44;
    text(v, bx, by, 20, bold, C.ink);
    text(l, bx, by - 13, 8.5, regular, C.muted);
  });

  /* ---------------- Page 2 ---------------- */
  page = pdf.addPage([A4.width, A4.height]);
  pages.push(page);
  y = A4.height - 50;
  brandMark(M, y, 12, C.goldDeep);
  page.drawRectangle({ x: M, y: y - 16, width: W, height: 1.4, color: C.gold });
  y -= 52;

  heading('Why sponsor BECE Vault', M, y, 17);
  y -= 22;
  const why = [
    ['A focused audience', 'Every visitor is an engineering student in Nepal: no wasted reach.'],
    ['High attention', 'Students come to study, read notes and practise past papers, and they come back every exam season.'],
    ['A clean, trusted site', 'No pop-ups or ad clutter. One clearly marked sponsor stands out instead of competing for attention.'],
    ['Long-lasting', 'The notes are used by batch after batch, so the audience renews every year.'],
  ];
  const ww = (W - 14) / 2;
  why.forEach(([t, d], i) => {
    const x = M + (i % 2) * (ww + 14);
    const by = y - Math.floor(i / 2) * 74;
    page.drawRectangle({ x, y: by - 62, width: ww, height: 62, color: C.soft });
    page.drawRectangle({ x, y: by - 62, width: 3, height: 62, color: C.gold });
    text(t, x + 14, by - 19, 10.5, bold, C.ink);
    para(d, x + 14, by - 34, ww - 26, 8.8, C.body);
  });
  y -= 74 * 2 + 14;

  heading('Sponsor spots', M, y, 17);
  y -= 22;
  const spots = [
    ['Home page feature', 'Your logo and one line on the home page, the first page most students open.'],
    ['Site-wide credit', '“Supported by” with your logo in the footer of every page.'],
    ['Exam-season spotlight', 'A featured spot on the past papers and study guides pages during exam weeks.'],
  ];
  const sw = (W - 20) / 3;
  spots.forEach(([t, d], i) => {
    const x = M + i * (sw + 10);
    page.drawRectangle({ x, y: y - 92, width: sw, height: 92, borderColor: C.line, borderWidth: 0.8, color: C.white });
    text(`0${i + 1}`, x + 12, y - 20, 9, bold, C.goldDeep);
    text(t, x + 12, y - 36, 10.5, bold, C.ink);
    para(d, x + 12, y - 51, sw - 24, 8.5, C.body);
  });
  y -= 92 + 12;
  para('Flexible monthly or semester-long terms. Rates and placements can be tailored: get in touch.', M, y, W, 9, C.muted);
  y -= 30;

  // Measured breakdowns, only when there's data behind them.
  const devices = share(data.devices);
  const sources = share(data.sources).slice(0, 3);
  if (devices.length || sources.length) {
    heading('How students visit', M, y, 13);
    y -= 18;
    const parts: string[] = [];
    if (devices.length) parts.push(`Devices: ${devices.map((d) => `${d.label} ${d.pct}%`).join(', ')}.`);
    if (sources.length) parts.push(`Top sources: ${sources.map((s) => `${s.label} ${s.pct}%`).join(', ')}.`);
    y = para(parts.join(' '), M, y, W, 9.5) - 18;
  }

  // Verifiable
  heading('Numbers you can check', M, y, 13);
  y -= 18;
  y = para(
    'All figures come from anonymous counters in a Google Firebase database, read live when this report was made. The database only accepts “+1” from browsers, so counts can’t be raised from the website, and the counting code is open source.',
    M, y, W, 9.5,
  ) - 6;
  let lx2 = M;
  lx2 += linkText('Raw visitor counter', lx2, y, 9, rawCounterUrl('bece-notes', 'visitors')) + 16;
  lx2 += linkText('Raw page-visit counter', lx2, y, 9, rawCounterUrl('bece-notes', 'pageviews')) + 16;
  lx2 += linkText('Counting code on GitHub', lx2, y, 9, `${REPO_URL}/blob/main/Website/src/content/visits.ts`) + 16;
  linkText('Live dashboard', lx2, y, 9, `${SITE_URL}/analytics`);
  y -= 34;

  // Contact
  const boxH = 92;
  page.drawRectangle({ x: M, y: y - boxH, width: W, height: boxH, color: C.green });
  page.drawRectangle({ x: M, y: y - boxH, width: 4, height: boxH, color: C.gold });
  text("Let's talk", M + 22, y - 30, 17, bold, C.onGreen);
  text('Arpan Adhikari · Founder, BECE Vault', M + 22, y - 48, 9.5, regular, C.onGreenMuted);
  const ex = M + 22;
  text(CONTACT_EMAIL, ex, y - 68, 10.5, bold, C.gold);
  addLink(ex, y - 68, width(CONTACT_EMAIL, 10.5, bold), 10.5, `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Sponsoring BECE Vault')}`);
  const siteT = SITE_HOST;
  const sx = M + W - 22 - width(siteT, 10.5, bold);
  text(siteT, sx, y - 68, 10.5, bold, C.onGreen);
  addLink(sx, y - 68, width(siteT, 10.5, bold), 10.5, SITE_URL);

  // Footer on both pages
  pages.forEach((p, i) => {
    page = p;
    const f = `BECE Vault · ${SITE_HOST} · Live data as of ${asOf}`;
    text(f, M, 26, 7.5, regular, C.muted);
    const n = `${i + 1} / ${pages.length}`;
    text(n, A4.width - M - width(n, 7.5), 26, 7.5, regular, C.muted);
  });

  return pdf.save();
}
