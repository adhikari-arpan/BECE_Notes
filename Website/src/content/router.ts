import { useSyncExternalStore } from 'react';

/**
 * Tiny client-side router on top of the browser History API: real URLs (/semester-1/dbms),
 * working Back/Forward buttons and shareable links, without an extra dependency.
 * The host must serve index.html for unknown paths (see Website/vercel.json).
 */

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, ''); // '' when the site lives at the domain root
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());
if (typeof window !== 'undefined') window.addEventListener('popstate', notify);

/** App path (e.g. `/semester-1`) -> URL including the deploy base path. */
export const withBase = (to: string) => `${BASE}${to.startsWith('/') ? to : `/${to}`}`;

export function navigate(to: string, { replace = false } = {}) {
  const url = withBase(to);
  if (url === window.location.pathname + window.location.search) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  notify();
}

const snapshot = () => window.location.pathname + window.location.search;

export interface Location {
  /** Path without the deploy base, always starting with `/`. */
  pathname: string;
  params: URLSearchParams;
}

export function useLocation(): Location {
  const href = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot,
  );
  const url = new URL(href, window.location.origin);
  let pathname = decodeURIComponent(url.pathname);
  if (BASE && pathname.startsWith(BASE)) pathname = pathname.slice(BASE.length) || '/';
  return { pathname: pathname.replace(/\/+$/, '') || '/', params: url.searchParams };
}
