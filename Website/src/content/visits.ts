import { useSyncExternalStore } from 'react';

/**
 * Lifetime counters stored in a Firebase Realtime Database (free Spark plan, data never
 * expires). The site is static, so the browser talks to the database's REST API directly;
 * the database rules (see Website/README.md) only allow a counter to go up by exactly 1,
 * so it can never be lowered or reset from the browser.
 *
 * - Visitors: +1 when a browser has no counted visit yet, or when 3 hours have passed
 *   since its last counted visit — returning later, or still using the site 3 hours on.
 *   The timestamp lives in localStorage, so all open tabs share it and don't double count.
 * - Page visits: +1 every time a page of the site is opened (home, a semester, a subject...).
 *
 * Each count also goes into a counter for the current day (Nepal time), stored as its own "site"
 * — counters/bece-notes-2026-10-09/visitors — so the same database rules apply unchanged.
 *
 * Breakdowns for the /analytics page work the same way, as lifetime counters only:
 * - which part of the site a page visit is in (counters/bece-notes-section-notes/pageviews)
 *   and, on subject pages, which subject (counters/bece-notes-subject-3-1f0a9c2e/pageviews, see analytics.ts);
 * - for each counted visitor, the kind of device (counters/bece-notes-device-mobile/visitors)
 *   where they came from (counters/bece-notes-source-google/visitors) and their country
 *   (counters/bece-notes-country-np/visitors, from the host's lookup; see api/geo.ts).
 * All anonymous: one "+1" per counter, nothing about the person is stored.
 */

/** e.g. https://your-project-default-rtdb.firebaseio.com — set in Website/.env */
const DB_URL = (import.meta.env.VITE_FIREBASE_DB_URL ?? '').replace(/\/+$/, '');
// One database can serve counters for several sites: counters/<site>/<counter>.
const SITE = 'bece-notes';
// Local development counts into separate counters so testing doesn't inflate the real numbers.
const SUFFIX = import.meta.env.DEV ? '-dev' : '';
const VISITORS = `visitors${SUFFIX}`;
const PAGE_VIEWS = `pageviews${SUFFIX}`;

/** The day the lifetime counters started (shown as "Counted since …" on the home page). */
export const COUNTING_SINCE = '25 September 2026';

/** A visitor counts again after 3 hours away (so one study session counts once, a later return counts again). */
const VISIT_WINDOW_MS = 3 * 60 * 60 * 1000;
const STORAGE_KEY = 'bece-notes:last-counted-visit';
const CHECK_INTERVAL_MS = 60 * 1000;

export interface SiteStats {
  /** Lifetime totals. */
  visitors: number | null;
  pageViews: number | null;
  /** Today's totals (Nepal time). */
  todayVisitors: number | null;
  todayPageViews: number | null;
}

let stats: SiteStats = { visitors: null, pageViews: null, todayVisitors: null, todayPageViews: null };

/** Today's date in Nepal, e.g. "2026-10-09" — the day counters reset at midnight Nepal time. */
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const listeners = new Set<() => void>();

/** Kinds of breakdown counters; each value is its own "site" (see breakdownSite). */
export type Breakdown = 'section' | 'subject' | 'device' | 'source' | 'country';
/** e.g. breakdownSite('section', 'notes') → "bece-notes-section-notes". */
export const breakdownSite = (kind: Breakdown, key: string) => `${SITE}-${kind}-${key}`;

/** The day the breakdown counters (sections, subjects, devices, sources) started. */
export const BREAKDOWNS_SINCE = '29 October 2026';
/** The day the country counters started. */
export const COUNTRIES_SINCE = '30 October 2026';

/**
 * Countries with their own counter (ISO codes; the database can only be read counter by counter,
 * so /analytics needs the list). Any other country is counted as "other".
 */
export const COUNTRY_CODES = [
  'NP', 'IN', 'BD', 'PK', 'LK', 'BT', 'MV', 'CN', 'HK', 'TW', 'JP', 'KR', 'MY', 'SG', 'TH', 'PH', 'ID', 'VN',
  'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'IL', 'TR', 'US', 'CA', 'MX', 'BR', 'GB', 'IE', 'DE', 'FR', 'NL', 'BE',
  'IT', 'ES', 'PT', 'PL', 'CZ', 'AT', 'CH', 'SE', 'NO', 'FI', 'DK', 'RU', 'UA', 'AU', 'NZ', 'ZA', 'NG', 'EG',
] as const;

/**
 * Counts this visitor's country. The country comes from the host (Vercel works it out per request;
 * see api/geo.ts) and only its two-letter code is used. Nothing is counted if it can't be found
 * (e.g. in local development, where there's no /api).
 */
async function countCountry() {
  try {
    const res = await fetch('/api/geo', { cache: 'no-store' });
    if (!res.ok) return;
    const { country } = (await res.json()) as { country?: string | null };
    if (!country) return;
    const code = (COUNTRY_CODES as readonly string[]).includes(country) ? country.toLowerCase() : 'other';
    hitBreakdown('country', code, VISITORS);
  } catch {
    // No country this time.
  }
}

/** A lifetime "+1" on a breakdown counter (no number is shown, so the reply isn't used). */
function hitBreakdown(kind: Breakdown, key: string, counter: string) {
  // Counter names may be at most 40 characters (database rules).
  if (!DB_URL || !/^[a-z0-9-]+$/.test(key) || breakdownSite(kind, key).length > 40) return;
  void fetch(`${DB_URL}/counters/${breakdownSite(kind, key)}/${counter}.json`, { method: 'PUT', body: JSON.stringify({ '.sv': { increment: 1 } }) }).catch(() => {});
}

/** "mobile", "tablet" or "desktop", from the browser's own report or its user agent. */
export function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet';
  const hint = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile;
  if (hint ?? /Mobi|iPhone|iPod|Android|Opera Mini|IEMobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Where a visitor came from, by kind of site (the full address isn't kept). */
const SOURCE_RULES: [RegExp, string][] = [
  [/(^|\.)(chatgpt\.com|openai\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/, 'ai-assistant'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)(duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./, 'other-search'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp'],
  [/(^|\.)(t\.me|telegram\.org)$/, 'telegram'],
  [/(^|\.)(discord\.com|discord\.gg)$/, 'discord'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, 'x'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)reddit\.com$/, 'reddit'],
  [/(^|\.)github\.com$/, 'github'],
  [/(^|\.)arpanadhikari7\.com\.np$/, 'portfolio'],
];

export function trafficSource(): string {
  // A shared link can say where it was posted: ?utm_source=facebook
  const utm = new URLSearchParams(location.search).get('utm_source')?.toLowerCase().replace(/[^a-z0-9-]/g, '');
  let host = '';
  try {
    host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
  } catch {
    host = '';
  }
  // Moving between pages of this site isn't a source; neither is an empty referrer (typed, bookmarked or an app).
  if (!host || host === location.hostname) {
    if (utm) return SOURCE_RULES.find(([re]) => re.test(`${utm}.com`))?.[1] ?? 'other';
    return 'direct';
  }
  if (/^(www\.)?arpanadhikari7\.com\.np$/.test(host)) return 'portfolio';
  return SOURCE_RULES.find(([re]) => re.test(host))?.[1] ?? 'other';
}

function update(key: keyof SiteStats, value: number) {
  stats = { ...stats, [key]: value };
  listeners.forEach((l) => l());
}

const endpoint = (counter: string, day?: string) => `${DB_URL}/counters/${day ? `${SITE}-${day}` : SITE}/${counter}.json`;

/** Counts (or just reads) both the lifetime counter and today's. */
function request(counter: string, key: 'visitors' | 'pageViews', action: 'hit' | 'get') {
  const todayKey = key === 'visitors' ? 'todayVisitors' : 'todayPageViews';
  void requestOne(endpoint(counter), key, action);
  void requestOne(endpoint(counter, today()), todayKey, action);
}

async function requestOne(url: string, key: keyof SiteStats, action: 'hit' | 'get') {
  if (!DB_URL) return;
  try {
    if (action === 'hit') {
      // Atomic server-side increment; safe when many visitors arrive at once.
      const res = await fetch(url, { method: 'PUT', body: JSON.stringify({ '.sv': { increment: 1 } }) });
      const value: unknown = res.ok ? await res.json() : null;
      if (typeof value === 'number') return update(key, value);
    }
    const res = await fetch(url);
    if (!res.ok) return;
    const value: unknown = await res.json();
    update(key, typeof value === 'number' ? value : 0); // null = nothing recorded yet
  } catch {
    // Database unreachable — leave the number hidden.
  }
}

// The counter's own timestamp is always kept (it isn't part of the cookie choice); if storage is
// blocked, each page load tracks its own 3-hour window instead.
let memoryLastCounted = 0;

function readLastCounted(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return memoryLastCounted;
  }
}

function writeLastCounted(time: number) {
  memoryLastCounted = time;
  try {
    localStorage.setItem(STORAGE_KEY, String(time));
  } catch {
    // Storage blocked (private mode etc.) — the in-memory value is used instead.
  }
}

function checkVisitor() {
  if (document.visibilityState !== 'visible') return;
  const now = Date.now();
  if (now - readLastCounted() >= VISIT_WINDOW_MS) {
    // Claim the slot before the request so other tabs don't count the same visit.
    writeLastCounted(now);
    request(VISITORS, 'visitors', 'hit');
    hitBreakdown('device', deviceType(), VISITORS);
    hitBreakdown('source', trafficSource(), VISITORS);
    void countCountry();
  } else if (stats.visitors === null) {
    request(VISITORS, 'visitors', 'get');
  }
}

let started = false;

/**
 * Call once at startup: counts this visitor if due and keeps checking while the site is open.
 * Visit counting always runs; it is not part of the cookie choice.
 */
export function startVisitTracking() {
  if (started || typeof window === 'undefined') return;
  if (!DB_URL) {
    console.info('[visits] VITE_FIREBASE_DB_URL is not set — visit counters disabled.');
    return;
  }
  started = true;
  checkVisitor();
  document.addEventListener('visibilitychange', checkVisitor);
  window.setInterval(checkVisitor, CHECK_INTERVAL_MS);
}

let lastPage = { key: '', time: 0 };

/**
 * Counts one page visit. Call whenever the user opens a page; `pageKey` identifies it. `section` is
 * the part of the site (see analytics.ts) and `subject` the subject page's key, for the breakdowns.
 */
export function trackPageView(pageKey: string, section?: string, subject?: string) {
  if (!DB_URL) return;
  const now = Date.now();
  // React's StrictMode runs effects twice in development — ignore an immediate repeat.
  if (pageKey === lastPage.key && now - lastPage.time < 1000) return;
  lastPage = { key: pageKey, time: now };
  request(PAGE_VIEWS, 'pageViews', 'hit');
  if (section) hitBreakdown('section', section, PAGE_VIEWS);
  if (subject) hitBreakdown('subject', subject, PAGE_VIEWS);
}

/** Lifetime and today's visitors and page visits; each is null while loading or if unavailable. */
export function useSiteStats(): SiteStats {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => stats,
  );
}

export const formatCount = (n: number | null) => (n === null ? '—' : n.toLocaleString('en-US'));
