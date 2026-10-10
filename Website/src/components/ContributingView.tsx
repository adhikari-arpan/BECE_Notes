import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { marked } from 'marked';
import { ArrowLeft, Award, BookOpen, Code2, FileStack, FolderUp, GitCommitHorizontal, GitFork, Github, GitPullRequest, ListTree } from 'lucide-react';
import { Link } from '@/components/Link';
// The guide is written once, in the repository's CONTRIBUTING.md, and shown here as-is.
import guide from '../../../CONTRIBUTING.md?raw';
import './MarkdownViewer.css';
import './ContributingView.css';

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
    doc.querySelectorAll('hr').forEach((hr) => hr.remove());
    // Give every section heading an id, for the "On this page" contents; "3. Folder structure" gets a number badge.
    const items: TocItem[] = [];
    const used = new Set<string>();
    doc.querySelectorAll('h2, h3').forEach((h) => {
      const text = (h.textContent ?? '').trim();
      let id = slugify(text);
      while (used.has(id)) id += '-2';
      used.add(id);
      h.id = id;
      items.push({ id, text, level: h.tagName === 'H2' ? 2 : 3 });
      const numbered = h.tagName === 'H2' && /^(\d+)\.\s*(.+)$/.exec(text);
      if (numbered) {
        const num = doc.createElement('span');
        num.className = 'cg-num';
        num.textContent = numbered[1];
        h.replaceChildren(num, doc.createTextNode(numbered[2]));
      }
    });
    // Each section becomes its own card; the welcome text before the first section is the intro card.
    const intro = doc.createElement('div');
    intro.className = 'cg-intro';
    const cards: HTMLElement[] = [];
    let current: HTMLElement = intro;
    for (const node of [...doc.body.childNodes]) {
      if (node.nodeName === 'H2') {
        current = doc.createElement('section');
        current.className = 'cg-section';
        cards.push(current);
      }
      current.append(node);
    }
    doc.body.replaceChildren(intro, ...cards);
    return { html: doc.body.innerHTML, toc: items };
  }, []);

  // A link to a section (e.g. /contributing#past-question-papers) opens there, after the page's scroll to top.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 0);
    return () => clearTimeout(timer);
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
        <p className="cg-lead">
          Notes, past papers or a website fix: every contribution helps the next batch. Here’s the short version; the
          full guide is below.
        </p>
        <div className="contribute-actions">
          <a className="cta-button" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> Open on GitHub</a>
          <a className="contribute-secondary" href={`${REPO_URL}/fork`} target="_blank" rel="noreferrer"><GitPullRequest size={16} /> Fork &amp; start a pull request</a>
        </div>
      </section>

      <section className="section-wrap cg-start">
        <h3 className="cg-start-title">Quick start</h3>
        <ol className="cg-steps">
          <li><GitFork size={18} /><strong>Fork</strong><span>Fork the repository on GitHub. No need to download it.</span></li>
          <li><FolderUp size={18} /><strong>Upload</strong><span>Open the right folder in your fork, then <em>Add file → Upload files</em>.</span></li>
          <li><GitCommitHorizontal size={18} /><strong>Commit</strong><span>Start the message with a prefix like <code>Notes:</code> or <code>Questions:</code>.</span></li>
          <li><GitPullRequest size={18} /><strong>Pull request</strong><span>Open a pull request. We check everything before it goes live.</span></li>
        </ol>

        <h3 className="cg-start-title">What are you adding?</h3>
        <div className="cg-paths">
          <a href="#folder-structure" onClick={goTo('folder-structure')}><BookOpen size={18} /><strong>Notes</strong><span>Folder layout and file names</span></a>
          <a href="#past-question-papers" onClick={goTo('past-question-papers')}><FileStack size={18} /><strong>Past papers</strong><span>Year_Spring/Fall_ShortForm</span></a>
          <a href="#contributing-to-the-website" onClick={goTo('contributing-to-the-website')}><Code2 size={18} /><strong>Website fix</strong><span>Code, design and bugs</span></a>
          <a href="#getting-credited" onClick={goTo('getting-credited')}><Award size={18} /><strong>Get credited</strong><span>10 valid files gets you listed</span></a>
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
