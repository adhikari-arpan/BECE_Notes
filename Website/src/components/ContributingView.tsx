import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { marked } from 'marked';
import { ArrowRight, Award, BookOpen, ChevronDown, Code2, FileStack, Github, GitPullRequest, ListTree, Send, Sparkles } from 'lucide-react';
import { Link } from '@/components/Link';
import { PageHero } from '@/components/PageHero';
import { pastQuestionCollections } from '@/content/notes';
// The guide is written once, in the repository's CONTRIBUTING.md, and shown here as-is.
import guide from '../../../CONTRIBUTING.md?raw';
import './MarkdownViewer.css';
import './ContributingView.css';

const REPO_URL = 'https://github.com/adhikari-arpan/BECE_Notes';

/** Papers collected so far, shown on the "Send a past paper" card. */
const paperCount = pastQuestionCollections.reduce((n, c) => n + c.files.length, 0);

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

  // The full guide is folded away until asked for, so the page starts short.
  const [guideOpen, setGuideOpen] = useState(false);

  // A link to a section (e.g. /contributing#past-question-papers) opens the guide there, after the page's scroll to top.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !document.getElementById(id)) return;
    setGuideOpen(true);
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 30);
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
    setGuideOpen(true);
    // After the guide has opened, so the section can be scrolled to.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
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
      <section className="semester-page-header section-wrap contributing-header pqi-header">
        <PageHero
          title={<>Help build <em>BECE Vault</em></>}
          kicker="Get involved"
          lead="Every paper and note you share helps the next batch. Pick how you’d like to help."
        />
      </section>

      {/* The easiest way to help, so it comes first and stands out. */}
      <section className="section-wrap cg-feature">
        <div className="cg-feature-card">
          <div className="cg-feature-text">
            <span className="cg-feature-badge"><Sparkles size={13} /> Easiest way to help · no GitHub needed</span>
            <h2>Send a past paper</h2>
            <p>
              Have a Pokhara University exam paper? Send the PDF in a minute, no account needed. We name it, check it and add it
              to the collection{paperCount ? <>, which already has <strong>{paperCount} papers</strong></> : ''}.
            </p>
            <ol className="cg-feature-steps">
              <li><span>1</span> Pick the subject, year and term</li>
              <li><span>2</span> Add the PDF</li>
              <li><span>3</span> It goes live after a quick check</li>
            </ol>
            <Link to="/send-paper" className="cta-button cg-feature-button"><Send size={16} /> Send a paper</Link>
          </div>
          <div className="cg-feature-art" aria-hidden="true">
            <FileStack size={64} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section className="section-wrap cg-more">
        <h3 className="cg-start-title">Other ways to help</h3>
        <div className="cg-ways">
          <a href="#folder-structure" onClick={goTo('folder-structure')}>
            <BookOpen size={20} />
            <strong>Share your notes</strong>
            <span>Upload them to a subject’s folder on GitHub and open a pull request.</span>
            <em>How to add notes <ArrowRight size={13} /></em>
          </a>
          <a href="#contributing-to-the-website" onClick={goTo('contributing-to-the-website')}>
            <Code2 size={20} />
            <strong>Improve the website</strong>
            <span>Fix a bug, a typo or the design. The site’s code is open on GitHub.</span>
            <em>Website guide <ArrowRight size={13} /></em>
          </a>
          <a href="#getting-credited" onClick={goTo('getting-credited')}>
            <Award size={20} />
            <strong>Get credited</strong>
            <span>Ten accepted files puts you on the Contributors page.</span>
            <em>How credit works <ArrowRight size={13} /></em>
          </a>
        </div>
        <div className="contribute-actions">
          <a className="contribute-secondary" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> Open on GitHub</a>
          <a className="contribute-secondary" href={`${REPO_URL}/fork`} target="_blank" rel="noreferrer"><GitPullRequest size={16} /> Fork &amp; start a pull request</a>
        </div>
      </section>

      {/* Everything else (folder layout, file names, pull requests…) is here, folded until it's needed. */}
      <section className="section-wrap cg-guide-wrap">
        <details className="cg-guide" open={guideOpen} onToggle={(e) => setGuideOpen(e.currentTarget.open)}>
          <summary>
            <ListTree size={18} />
            <span>
              <strong>Full guide for GitHub contributions</strong>
              <small>Folder layout, file names, commit messages, pull requests and licence</small>
            </span>
            <ChevronDown size={18} className="cg-guide-chevron" />
          </summary>
          <div className="contributing-layout">
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
          </div>
        </details>
      </section>
    </>
  );
}
