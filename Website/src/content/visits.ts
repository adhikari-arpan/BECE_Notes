import { useSyncExternalStore } from 'react';

/**
 * Lifetime visit counter stored in a Firebase Realtime Database (free Spark plan, data
 * never expires). The site is static, so the browser talks to the database's REST API
 * directly; the database rules (see Website/README.md) only allow the count to go up by
 * exactly 1, so it can never be lowered or reset from the browser.
 *
 * A visit is counted when a browser has no counted visit yet, or when 30 minutes have
 * passed since its last counted visit. That covers returning later as well as someone
 * who keeps the site open: every 30 minutes of use adds one more. The timestamp lives in
 * localStorage, so all open tabs share it and don't double count.
 */

/** e.g. https://bece-notes-default-rtdb.firebaseio.com — set in Website/.env */
const DB_URL = (import.meta.env.VITE_FIREBASE_DB_URL ?? '').replace(/\/+$/, '');
// Local development counts into a separate counter so testing doesn't inflate the real number.
// One database can serve counters for several sites: counters/<site>/<counter>.
const SITE = 'bece-notes';
const COUNTER = import.meta.env.DEV ? 'visits-dev' : 'visits';
const ENDPOINT = `${DB_URL}/counters/${SITE}/${COUNTER}.json`;
const VISIT_WINDOW_MS = 30 * 60 * 1000;
const STORAGE_KEY = 'bece-notes:last-counted-visit';
const CHECK_INTERVAL_MS = 60 * 1000;

let count: number | null = null;
const listeners = new Set<() => void>();

function setCount(value: number) {
  count = value;
  listeners.forEach((l) => l());
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

async function request(action: 'hit' | 'get') {
  if (!DB_URL) return;
  try {
    if (action === 'hit') {
      // Atomic server-side increment; safe when many visitors arrive at once.
      const res = await fetch(ENDPOINT, { method: 'PUT', body: JSON.stringify({ '.sv': { increment: 1 } }) });
      const value: unknown = res.ok ? await res.json() : null;
      if (typeof value === 'number') return setCount(value);
    }
    const res = await fetch(ENDPOINT);
    if (!res.ok) return;
    const value: unknown = await res.json();
    setCount(typeof value === 'number' ? value : 0); // null = no visits recorded yet
  } catch {
    // Database unreachable — leave the number hidden.
  }
}

function checkVisit() {
  if (document.visibilityState !== 'visible') return;
  const now = Date.now();
  if (now - readLastCounted() >= VISIT_WINDOW_MS) {
    // Claim the slot before the request so other tabs don't count the same visit.
    writeLastCounted(now);
    request('hit');
  } else if (count === null) {
    request('get');
  }
}

let started = false;

/** Call once at startup: counts this visit if due and keeps checking while the site is open. */
export function startVisitTracking() {
  if (started || typeof window === 'undefined') return;
  if (!DB_URL) {
    console.info('[visits] VITE_FIREBASE_DB_URL is not set — visit counter disabled.');
    return;
  }
  started = true;
  checkVisit();
  document.addEventListener('visibilitychange', checkVisit);
  window.setInterval(checkVisit, CHECK_INTERVAL_MS);
}

/** Current total visit count, or null while loading / if the counter is unavailable. */
export function useVisitCount(): number | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => count,
  );
}

export const formatCount = (n: number) => n.toLocaleString('en-US');
