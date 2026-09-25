import { Moon, Sun } from 'lucide-react';
import { setTheme, useTheme } from '@/content/theme';

export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
