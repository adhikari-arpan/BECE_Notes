import { useSyncExternalStore } from 'react';

/**
 * Lifetime counters stored in a Firebase Realtime Database (free Spark plan, data never
 * expires). The site is static, so the browser talks to the database's REST API directly;
 * the database rules (see Website/README.md) only allow a counter to go up by exactly 1,
 * so it can never be lowered or reset from the browser.
 *
 * - Visitors: +1 when a browser has no counted visit yet, or when 30 minutes have passed
 *   since its last counted visit — returning later, or still using the site 30 minutes on.
 *   The timestamp lives in localStorage, so all open tabs share it and don't double count.
 * - Page visits: +1 every time a page of the site is opened (home, a semester, a subject...).
 */

/** e.g. https://your-project-default-rtdb.firebaseio.com — set in Website/.env */
const DB_URL = (import.meta.env.VITE_FIREBASE_DB_URL ?? '').replace(/\/+$/, '');
// One database can serve counters for several sites: counters/<site>/<counter>.
const SITE = 'bece-notes';
// Local development counts into separate counters so testing doesn't inflate the real numbers.
const SUFFIX = import.meta.env.DEV ? '-dev' : '';
const VISITORS = `visitors${SUFFIX}`;
const PAGE_VIEWS = `pageviews${SUFFIX}`;

const VISIT_WINDOW_MS = 30 * 60 * 1000;
const STORAGE_KEY = 'bece-notes:last-counted-visit';
const CHECK_INTERVAL_MS = 60 * 1000;

export interface SiteStats {
  visitors: number | null;
  pageViews: number | null;
}

let stats: SiteStats = { visitors: null, pageViews: null };
const listeners = new Set<() => void>();

function update(key: keyof SiteStats, value: number) {
  stats = { ...stats, [key]: value };
  listeners.forEach((l) => l());
}

const endpoint = (counter: string) => `${DB_URL}/counters/${SITE}/${counter}.json`;

async function request(counter: string, key: keyof SiteStats, action: 'hit' | 'get') {
  if (!DB_URL) return;
  try {
    if (action === 'hit') {
      // Atomic server-side increment; safe when many visitors arrive at once.
      const res = await fetch(endpoint(counter), { method: 'PUT', body: JSON.stringify({ '.sv': { increment: 1 } }) });
      const value: unknown = res.ok ? await res.json() : null;
      if (typeof value === 'number') return update(key, value);
    }
    const res = await fetch(endpoint(counter));
    if (!res.ok) return;
    const value: unknown = await res.json();
    update(key, typeof value === 'number' ? value : 0); // null = nothing recorded yet
  } catch {
    // Database unreachable — leave the number hidden.
  }
}

// Fallback when localStorage is blocked: then each page load tracks its own 30-minute window.
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
  } else if (stats.visitors === null) {
    request(VISITORS, 'visitors', 'get');
  }
}

let started = false;

/** Call once at startup: counts this visitor if due and keeps checking while the site is open. */
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

/** Counts one page visit. Call whenever the user opens a page; `pageKey` identifies it. */
export function trackPageView(pageKey: string) {
  if (!DB_URL) return;
  const now = Date.now();
  // React's StrictMode runs effects twice in development — ignore an immediate repeat.
  if (pageKey === lastPage.key && now - lastPage.time < 1000) return;
  lastPage = { key: pageKey, time: now };
  request(PAGE_VIEWS, 'pageViews', 'hit');
}

/** Current lifetime visitors and page visits; each is null while loading or if unavailable. */
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
