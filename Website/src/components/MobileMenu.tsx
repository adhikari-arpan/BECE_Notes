import { useEffect, useRef, useState } from 'react';
import { BookOpen, Calculator, FileStack, House, Menu, ScrollText, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { ChiyaButton } from '@/components/TipJar';
import { ThemeToggle } from '@/components/ThemeToggle';

const LINKS = [
  { to: '/', label: 'Home', icon: House, match: (p: string) => p === 'home' },
  { to: '/notes', label: 'Notes', icon: BookOpen, match: (p: string) => p === 'notes' },
  { to: '/past-questions', label: 'Past Questions', icon: FileStack, match: (p: string) => p.startsWith('past-questions') },
  { to: '/syllabus', label: 'Syllabus', icon: ScrollText, match: (p: string) => p.startsWith('syllabus') },
  { to: '/cgpa-calculator', label: 'CGPA Calculator', icon: Calculator, match: (p: string) => p === 'cgpa-calculator' },
];

/** Phones only (see .mobile-menu in index.css): one ☰ button holding every top-bar link, the Chiya button and the theme switch. */
export function MobileMenu({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // A new page closes the menu.
  useEffect(() => setOpen(false), [page]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="mobile-menu" ref={box}>
      <button
        className="mobile-menu-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <nav className="mobile-menu-panel" id="mobile-menu-panel" aria-label="Site">
          {LINKS.map(({ to, label, icon: Icon, match }) => (
            <Link key={to} to={to} className={`mobile-menu-link ${match(page) ? 'is-current' : ''}`} aria-current={match(page) ? 'page' : undefined} onClick={() => setOpen(false)}>
              <Icon size={17} /> {label}
            </Link>
          ))}
          <div className="mobile-menu-foot">
            <span onClickCapture={() => setOpen(false)}><ChiyaButton /></span>
            <span className="mobile-menu-theme">Theme <ThemeToggle /></span>
          </div>
        </nav>
      )}
    </div>
  );
}
