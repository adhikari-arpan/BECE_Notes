import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, FileQuestion, FileText, LayoutGrid, ListOrdered, Search, X } from 'lucide-react';
import { navigate } from '@/content/router';
import { searchSite, type SearchItem } from '@/content/siteSearch';

const KIND_LABEL: Record<SearchItem['kind'], string> = { subject: 'Subject', unit: 'Unit', file: 'Note', paper: 'Past paper', page: 'Page' };
const KIND_ICON = { subject: BookOpen, unit: ListOrdered, file: FileText, paper: FileQuestion, page: LayoutGrid };
const EXAMPLES = ['DBMS', 'SQL', '2024 fall', 'CGPA'];

/**
 * The navbar's search: type straight into the field and results drop down below it.
 * Ctrl+K (⌘K) or "/" jumps to it. On phones a magnifier opens the field under the top bar.
 */
export function SiteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false); // the results are showing
  const [mobileOpen, setMobileOpen] = useState(false); // phones: the field is showing
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const results = useMemo(() => searchSite(query), [query]);

  const openSearch = () => {
    setMobileOpen(true);
    setOpen(true);
    window.setTimeout(() => input.current?.focus(), 0);
  };
  const close = () => {
    setOpen(false);
    setMobileOpen(false);
    input.current?.blur();
  };

  // Ctrl+K / ⌘K / "/" jumps to the field from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // A click outside closes the results.
  useEffect(() => {
    if (!open && !mobileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, mobileOpen]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (item: SearchItem) => {
    setQuery('');
    close();
    navigate(item.to);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  };

  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <div className={`site-search ${mobileOpen ? 'is-mobile-open' : ''}`} ref={box}>
      <button className="site-search-toggle" onClick={openSearch} aria-label="Search notes, units and past papers">
        <Search size={17} />
      </button>

      <div className="site-search-field">
        <Search size={15} />
        <input
          ref={input}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search notes, units, past papers…"
          aria-label="Search notes, units and past papers"
          role="combobox"
          aria-expanded={open}
          aria-controls="site-search-results"
          aria-activedescendant={open && results[active] ? `site-search-r-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button className="site-search-clear" onClick={() => { setQuery(''); input.current?.focus(); }} aria-label="Clear search"><X size={14} /></button>
        ) : (
          <kbd aria-hidden="true">{mac ? '⌘K' : 'Ctrl K'}</kbd>
        )}
      </div>

      {open && (
        <div className="site-search-panel">
          {query.trim() ? (
            results.length ? (
              <ul className="site-search-results" id="site-search-results" role="listbox" ref={list}>
                {results.map((r, i) => {
                  const Icon = KIND_ICON[r.kind];
                  return (
                    <li key={`${r.kind}:${r.to}:${r.title}`} id={`site-search-r-${i}`} role="option" aria-selected={i === active} data-i={i}>
                      {/* mousedown is kept from the input so it doesn't lose focus before the click lands */}
                      <button className={`search-result ${i === active ? 'is-active' : ''}`} onMouseMove={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => go(r)}>
                        <span className={`search-icon search-icon-${r.kind}`}><Icon size={15} /></span>
                        <span className="search-text"><strong title={r.title}>{r.title}</strong><small title={r.context}>{r.context}</small></span>
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
              {EXAMPLES.map((x) => <button key={x} onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(x); input.current?.focus(); }}>{x}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
