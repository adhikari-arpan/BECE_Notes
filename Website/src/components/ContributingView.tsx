import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { marked } from 'marked';
import { ArrowLeft, Github, GitPullRequest, ListTree } from 'lucide-react';
import { Link } from '@/components/Link';
// The guide is written once, in the repository's CONTRIBUTING.md, and shown here as-is.
import guide from '../../../CONTRIBUTING.md?raw';

const REPO_URL = 'https://github.com/adhikari-arpan/BECE_Notes';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** "🗂️ 3. Folder structure" → "folder-structure" */
const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/^\d+\s*/, '').replace(/\s+/g, '-') || 'section';

export function ContributingView() {
  const { html, toc } = useMemo(() => {
    // The page has its own heading, so drop the file's "# Contributing to BECE Vault" line.
    const body = guide.replace(/^#\s.*\n/, '');
    const doc = new DOMParser().parseFromString(marked.parse(body, { async: false }), 'text/html');
    doc.querySelectorAll('a[href^="http"], a[href^="mailto"]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noreferrer');
    });
    // Wide tables scroll sideways on their own.
    doc.querySelectorAll('table').forEach((table) => {
      const wrap = doc.createElement('div');
      wrap.className = 'md-table';
      table.replaceWith(wrap);
      wrap.append(table);
    });
    // Give every section heading an id, for the "On this page" contents.
    const items: TocItem[] = [];
    const used = new Set<string>();
    doc.querySelectorAll('h2, h3').forEach((h) => {
      let id = slugify(h.textContent ?? '');
      while (used.has(id)) id += '-2';
      used.add(id);
      h.id = id;
      items.push({ id, text: (h.textContent ?? '').trim(), level: h.tagName === 'H2' ? 2 : 3 });
    });
    return { html: doc.body.innerHTML, toc: items };
  }, []);

  // Highlight the section currently being read.
  const [active, setActive] = useState(toc[0]?.id ?? '');
  useEffect(() => {
    const headings = toc.map((t) => document.getElementById(t.id)).filter((h): h is HTMLElement => !!h);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  const goTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  const tocList = (
    <ul>
      {toc.map((t) => (
        <li key={t.id} className={`toc-level-${t.level} ${active === t.id ? 'active' : ''}`}>
          <a href={`#${t.id}`} onClick={goTo(t.id)}>{t.text}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <section className="semester-page-header section-wrap contributing-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Get involved</span>
            <h2>Contributing Guidelines</h2>
          </div>
        </div>
        <div className="contribute-actions">
          <a className="cta-button" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> Open on GitHub</a>
          <a className="contribute-secondary" href={`${REPO_URL}/fork`} target="_blank" rel="noreferrer"><GitPullRequest size={16} /> Fork &amp; start a pull request</a>
        </div>
      </section>

      <section className="contributing-layout section-wrap">
        <aside className="contributing-toc" aria-label="On this page">
          <span className="contributing-toc-title"><ListTree size={14} /> On this page</span>
          {tocList}
        </aside>
        {/* Phones: the same contents, folded into a menu above the guide. */}
        <details className="contributing-toc-mobile">
          <summary><ListTree size={14} /> On this page</summary>
          {tocList}
        </details>
        <article className="markdown-preview contributing-guide" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </>
  );
}
