import { ChevronRight } from 'lucide-react';
import { Link } from '@/components/Link';

export interface Crumb {
  label: string;
  /** Leave out for the current page (the last crumb). */
  to?: string;
}

/** "Home › Semester III › DBMS": where this page sits, each step a link back. */
export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={`crumbs ${className}`} aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`}>
            {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
