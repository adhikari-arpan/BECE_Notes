import type { ReactNode } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { setThemeMode, useThemeMode, type ThemeMode } from '@/content/theme';

/** One button that cycles System → Light → Dark; the icon shows the current mode. */
const MODES: Record<ThemeMode, { next: ThemeMode; label: string; icon: ReactNode }> = {
  system: { next: 'light', label: 'System', icon: <Monitor size={16} /> },
  light: { next: 'dark', label: 'Light', icon: <Sun size={16} /> },
  dark: { next: 'system', label: 'Dark', icon: <Moon size={16} /> },
};

export function ThemeToggle() {
  const mode = useThemeMode();
  const { next, label, icon } = MODES[mode];
  const hint = `Theme: ${label} — switch to ${MODES[next].label.toLowerCase()}${next === 'system' ? ' default' : ' mode'}`;

  return (
    <button className="theme-toggle" onClick={() => setThemeMode(next)} aria-label={hint} title={hint}>
      {icon}
    </button>
  );
}
