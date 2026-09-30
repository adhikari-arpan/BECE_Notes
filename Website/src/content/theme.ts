import { useSyncExternalStore } from 'react';
import { deviceStore } from '@/content/consent';

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

// Saved on the device only with cookie consent; otherwise the choice lasts for this visit.
function savedTheme(): Theme | null {
  const value = deviceStore.get(STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

const systemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

/** "system" forgets the saved choice, so the site goes back to following the device. */
export function setThemeMode(mode: ThemeMode) {
  if (mode === 'system') deviceStore.remove(STORAGE_KEY);
  else deviceStore.set(STORAGE_KEY, mode);
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
