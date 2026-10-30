import { semesters, type Semester, type Subject } from '@/content/notes';
import { COUNTRY_CODES, breakdownSite, type Breakdown } from '@/content/visits';

/**
 * Reading side of the visit counters, for the unlisted /analytics page. Every number is one
 * counter in the Firebase database (see visits.ts); the database only lets the browser read a
 * counter by its exact name, so the page asks for each one it knows about.
 */

const DB_URL = (import.meta.env.VITE_FIREBASE_DB_URL ?? '').replace(/\/+$/, '');
const SITE = 'bece-notes';
/** A counter's raw value straight from the database, which anyone can open to check the page. */
export const rawCounterUrl = (site: string, counter: string) => `${DB_URL}/counters/${site}/${counter}.json`;
/** The database's address, e.g. "web-counters-default-rtdb.asia-southeast1.firebasedatabase.app". */
export const DB_HOST = DB_URL.replace(/^https?:\/\//, '');

/** The first day with daily counters is found from the data; reading starts here. */
const DAILY_FROM = '2026-09-25';

/** Parts of the site, as counted per page visit (App.tsx passes `sectionFor(page)`). */
export const SECTIONS = [
  { key: 'home', label: 'Home page' },
  { key: 'notes', label: 'Notes overview' },
  { key: 'semester', label: 'Semester pages' },
  { key: 'subject', label: 'Subject notes (reading)' },
  { key: 'past-questions', label: 'Past questions' },
  { key: 'syllabus', label: 'Syllabus' },
  { key: 'study-guides', label: 'Study guides' },
  { key: 'cgpa', label: 'CGPA calculator' },
  { key: 'grading', label: 'PU grading guide' },
  { key: 'other', label: 'About, contributors and other pages' },
] as const;

const SECTION_OF_PAGE: Record<string, (typeof SECTIONS)[number]['key']> = {
  home: 'home',
  notes: 'notes',
  semester: 'semester',
  subject: 'subject',
  'past-questions': 'past-questions',
  'past-questions-semester': 'past-questions',
  syllabus: 'syllabus',
  'syllabus-semester': 'syllabus',
  'study-guides': 'study-guides',
  'study-guide': 'study-guides',
  'cgpa-calculator': 'cgpa',
  'pu-grading-system': 'grading',
};
export const sectionFor = (page: string) => SECTION_OF_PAGE[page] ?? 'other';
/**
 * A subject's counter key: its semester and a short fixed code from its URL name, e.g. "3-1f0a9c2e".
 * Counter names may be at most 40 characters, which full subject names would pass.
 */
export const subjectKey = (semester: Semester, subject: Subject) => `${semester.id}-${hash8(subject.slug)}`;

/** FNV-1a: the same 8 hex characters for the same text, every time. */
function hash8(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export const DEVICES = [
  { key: 'mobile', label: 'Phone' },
  { key: 'desktop', label: 'Computer' },
  { key: 'tablet', label: 'Tablet' },
] as const;

export const SOURCES = [
  { key: 'direct', label: 'Direct (typed, bookmark or app)' },
  { key: 'google', label: 'Google' },
  { key: 'facebook', label: 'Facebook / Messenger' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'discord', label: 'Discord' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X (Twitter)' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'ai-assistant', label: 'AI assistants (ChatGPT, Claude…)' },
  { key: 'bing', label: 'Bing' },
  { key: 'other-search', label: 'Other search engines' },
  { key: 'github', label: 'GitHub' },
  { key: 'portfolio', label: 'Arpan’s portfolio' },
  { key: 'other', label: 'Other websites' },
] as const;

/** "NP" → 🇳🇵 (two regional-indicator letters). */
const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

/** The countries with their own counter (see visits.ts), plus everything else. */
export const COUNTRIES = [
  ...COUNTRY_CODES.map((code) => ({ key: code.toLowerCase(), label: `${flag(code)}  ${regionNames?.of(code) ?? code}` })),
  { key: 'other', label: '🌐  Other countries' },
];

export interface DayCount { date: string; visitors: number; pageViews: number }
export interface Row { key: string; label: string; value: number }
export interface AnalyticsData {
  visitors: number;
  pageViews: number;
  /** One entry per day from the first day with daily counters to today (Nepal time). */
  daily: DayCount[];
  sections: Row[];
  subjects: (Row & { semester: string })[];
  devices: Row[];
  sources: Row[];
  /** Visitors by country (label has the flag), largest first. */
  countries: Row[];
  loadedAt: Date;
}

/** Today in Nepal as YYYY-MM-DD. */
export const nepalToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/** One counter's value: null if it was never counted (or the database is unreachable). */
async function read(site: string, counter: string): Promise<number | null> {
  const res = await fetch(`${DB_URL}/counters/${site}/${counter}.json`);
  if (!res.ok) throw new Error(`Counter ${site}/${counter}: HTTP ${res.status}`);
  const value: unknown = await res.json();
  return typeof value === 'number' ? value : null;
}

/** Runs the reads a few at a time, so a long history doesn't open hundreds of requests at once. */
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** A breakdown counter that can't be read counts as 0, so one bad counter doesn't hide the whole page. */
const readOr0 = (site: string, counter: string) => read(site, counter).then((v) => v ?? 0, () => 0);

const rows = async (kind: Breakdown, list: readonly { key: string; label: string }[], counter: string): Promise<Row[]> =>
  (await pool([...list], 12, async (r) => ({ key: r.key, label: r.label, value: await readOr0(breakdownSite(kind, r.key), counter) })))
    .sort((a, b) => b.value - a.value);

/** Everything the analytics page shows. Always reads the live counters (also in local development). */
export async function loadAnalytics(): Promise<AnalyticsData> {
  if (!DB_URL) throw new Error('VITE_FIREBASE_DB_URL is not set, so there are no counters to read.');
  const days = daysBetween(DAILY_FROM, nepalToday());
  const subjectList = semesters.flatMap((sem) =>
    sem.subjects.filter((s) => s.kind !== 'syllabus' && !s.electiveSlot).map((s) => ({ key: subjectKey(sem, s), label: s.name, semester: sem.label })),
  );

  const [visitors, pageViews, dailyRaw, sections, devices, sources, countries, subjects] = await Promise.all([
    read(SITE, 'visitors'),
    read(SITE, 'pageviews'),
    pool(days, 16, async (date) => ({ date, visitors: await read(`${SITE}-${date}`, 'visitors'), pageViews: await read(`${SITE}-${date}`, 'pageviews') })),
    rows('section', SECTIONS, 'pageviews'),
    rows('device', DEVICES, 'visitors'),
    rows('source', SOURCES, 'visitors'),
    rows('country', COUNTRIES, 'visitors'),
    pool(subjectList, 16, async (s) => ({ ...s, value: await readOr0(breakdownSite('subject', s.key), 'pageviews') })),
  ]);

  // Daily counters began after the lifetime ones: start the series at the first day with data.
  const first = dailyRaw.findIndex((d) => d.visitors !== null || d.pageViews !== null);
  const daily = (first < 0 ? [] : dailyRaw.slice(first)).map((d) => ({ date: d.date, visitors: d.visitors ?? 0, pageViews: d.pageViews ?? 0 }));

  return {
    visitors: visitors ?? 0,
    pageViews: pageViews ?? 0,
    daily,
    sections,
    devices,
    sources,
    countries,
    subjects: subjects.filter((s) => s.value > 0).sort((a, b) => b.value - a.value),
    loadedAt: new Date(),
  };
}
