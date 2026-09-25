import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Light / dark theme. The choice is saved per browser; until someone picks one, the site
 * follows their device setting. index.html applies the saved theme before the page paints,
 * so there is no flash of the wrong theme on load.
 */

const STORAGE_KEY = 'bece-notes:theme';
const listeners = new Set<() => void>();

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

const systemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked — the theme still applies for this visit.
  }
  apply(theme);
}

/** Follow device theme changes for visitors who haven't picked one themselves. */
export function startThemeSync() {
  if (!document.documentElement.dataset.theme) apply(savedTheme() ?? systemTheme());
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!savedTheme()) apply(systemTheme());
  });
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    currentTheme,
  );
}
