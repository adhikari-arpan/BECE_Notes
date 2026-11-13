import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CornerDownLeft, FileQuestion, FileText, LayoutGrid, ListOrdered, Search, X } from 'lucide-react';
import { navigate } from '@/content/router';
import { searchSite, type SearchItem } from '@/content/siteSearch';

const KIND_LABEL: Record<SearchItem['kind'], string> = { subject: 'Subject', unit: 'Unit', file: 'Note', paper: 'Past paper', page: 'Page' };
const KIND_ICON = { subject: BookOpen, unit: ListOrdered, file: FileText, paper: FileQuestion, page: LayoutGrid };
const EXAMPLES = ['DBMS', 'SQL', '2024 fall', 'CGPA'];

/** The navbar's Search button; also opens with Ctrl+K (⌘K) or "/". */
export function SiteSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <>
      <button className="nav-search" onClick={() => setOpen(true)} aria-label="Search notes, units and past papers" title="Search (Ctrl+K)">
        <Search size={15} />
        <span className="nav-search-text">Search</span>
        <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const results = useMemo(() => searchSite(query), [query]);

  useEffect(() => {
    input.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (item: SearchItem) => {
    onClose();
    navigate(item.to);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  };

  return (
    <div className="search-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search BECE Vault" onKeyDown={onKey}>
        <div className="search-field">
          <Search size={18} />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, units, notes and past papers…"
            aria-label="Search"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-r-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="search-close" onClick={onClose} aria-label="Close search"><X size={16} /></button>
        </div>

        {query.trim() ? (
          results.length ? (
            <ul className="search-results" id="search-results" role="listbox" ref={list}>
              {results.map((r, i) => {
                const Icon = KIND_ICON[r.kind];
                return (
                  <li key={`${r.kind}:${r.to}:${r.title}`} id={`search-r-${i}`} role="option" aria-selected={i === active} data-i={i}>
                    <button className={`search-result ${i === active ? 'is-active' : ''}`} onMouseMove={() => setActive(i)} onClick={() => go(r)}>
                      <span className={`search-icon search-icon-${r.kind}`}><Icon size={15} /></span>
                      <span className="search-text"><strong>{r.title}</strong><small>{r.context}</small></span>
                      <span className="search-kind">{KIND_LABEL[r.kind]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="search-empty">No matches for “{query.trim()}”. Try a subject name, a short form like DBMS, or a year.</p>
          )
        ) : (
          <div className="search-hint">
            <span>Try</span>
            {EXAMPLES.map((x) => <button key={x} onClick={() => setQuery(x)}>{x}</button>)}
          </div>
        )}

        <div className="search-foot" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
          <span><kbd><CornerDownLeft size={11} /></kbd> to open</span>
          <span><kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
