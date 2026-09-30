import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
/** What the visitor picked: follow the device ('system', the default) or a fixed theme. */
export type ThemeMode = 'system' | Theme;

/**
 * Light / dark theme. The choice is saved per browser; until someone picks one (or after they
 * switch back to "system"), the site follows their device setting. index.html applies the saved
 * theme before the page paints, so there is no flash of the wrong theme on load.
 */

const STORAGE_KEY = 'bece-notes:theme';
const listeners = new Set<() => void>();
/** This visit's choice, used when the browser blocks storage. */
let unsavedChoice: Theme | null = null;

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return unsavedChoice;
  }
}

const systemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

/** "system" forgets the saved choice, so the site goes back to following the device. */
export function setThemeMode(mode: ThemeMode) {
  unsavedChoice = mode === 'system' ? null : mode;
  try {
    if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage blocked — the theme still applies for this visit.
  }
  apply(mode === 'system' ? systemTheme() : mode);
}

/** Follow device theme changes for visitors who haven't picked one themselves. */
export function startThemeSync() {
  if (!document.documentElement.dataset.theme) apply(savedTheme() ?? systemTheme());
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!savedTheme()) apply(systemTheme());
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The visitor's choice, including "system". */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, () => savedTheme() ?? 'system');
}
