import { useSyncExternalStore } from 'react';

/**
 * Cookie consent for the site's saving features. Until a visitor accepts, nothing they do is saved
 * on the device: features that remember things (theme, sidebar width, CGPA grades, PDF highlights,
 * the tip reminder) keep them in memory for this visit only. Accepting saves what was used so far;
 * declining also erases anything those features saved before.
 *
 * Site statistics (Google Analytics, Vercel Analytics / Speed Insights, the visit counters) are not
 * part of this choice and always run.
 *
 * Every saving feature reads and writes through `deviceStore` / `sessionStore` below instead of
 * touching localStorage directly, so this rule holds everywhere.
 */

export type Consent = 'accepted' | 'declined';

/** Remembering the choice itself is strictly necessary, so it is stored either way. */
const CONSENT_KEY = 'bece-notes:consent';
/** Everything the saving features store starts with one of these. */
const SITE_PREFIXES = ['bece-notes:', 'bece-cgpa'];
/** Kept when declining: the choice itself and the visit counter's timestamp (statistics always run). */
const KEEP_KEYS = new Set([CONSENT_KEY, 'bece-notes:last-counted-visit']);

let consent: Consent | null = readConsent();
let bannerOpen = consent === null;
const listeners = new Set<() => void>();

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}

const emit = () => listeners.forEach((l) => l());

export const hasConsent = () => consent === 'accepted';

/* ------------------------------ storage ------------------------------ */

function makeStore(backing: () => Storage) {
  // Values kept for this visit when saving isn't allowed (or storage is blocked).
  const memory = new Map<string, string>();
  return {
    memory,
    get(key: string): string | null {
      if (memory.has(key)) return memory.get(key)!;
      if (!hasConsent()) return null;
      try {
        return backing().getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      memory.set(key, value);
      if (!hasConsent()) return;
      try {
        backing().setItem(key, value);
        memory.delete(key);
      } catch {
        // Storage full or blocked: the in-memory value still works for this visit.
      }
    },
    remove(key: string) {
      memory.delete(key);
      try {
        backing().removeItem(key);
      } catch {
        // Nothing to remove.
      }
    },
    /** After accepting: write this visit's values to the device. */
    flush() {
      for (const [key, value] of memory) {
        try {
          backing().setItem(key, value);
          memory.delete(key);
        } catch {
          // Keep it in memory.
        }
      }
    },
    /** After declining: erase everything the saving features stored. */
    clear() {
      try {
        const storage = backing();
        for (let i = storage.length - 1; i >= 0; i--) {
          const key = storage.key(i);
          if (key && !KEEP_KEYS.has(key) && SITE_PREFIXES.some((p) => key.startsWith(p))) storage.removeItem(key);
        }
      } catch {
        // Storage unavailable — nothing was saved.
      }
    },
  };
}

/** Kept on this device across visits (localStorage) — only once cookies are accepted. */
export const deviceStore = makeStore(() => localStorage);
/** Kept until the tab closes (sessionStorage) — only once cookies are accepted. */
export const sessionStore = makeStore(() => sessionStorage);

/* ------------------------------ choice ------------------------------ */

export function setConsent(choice: Consent) {
  consent = choice;
  bannerOpen = false;
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Can't remember the choice; the banner will ask again next visit.
  }
  if (choice === 'accepted') {
    deviceStore.flush();
    sessionStore.flush();
  } else {
    deviceStore.clear();
    sessionStore.clear();
  }
  emit();
}

/** Reopens the banner so the visitor can change their choice (footer "Cookie settings"). */
export function openCookieSettings() {
  bannerOpen = true;
  emit();
}

export const closeCookieBanner = () => {
  bannerOpen = false;
  emit();
};

let snapshot = { consent, bannerOpen };
const getSnapshot = () => {
  if (snapshot.consent !== consent || snapshot.bannerOpen !== bannerOpen) snapshot = { consent, bannerOpen };
  return snapshot;
};

export function useConsent() {
  return useSyncExternalStore((l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, getSnapshot);
}
