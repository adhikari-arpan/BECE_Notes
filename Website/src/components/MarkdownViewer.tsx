import { useMemo } from 'react';
import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { Clock } from 'lucide-react';
import 'katex/dist/katex.min.css';

/** GitHub-flavoured Markdown plus `$…$` / `$$…$$` maths, as the notes are written. */
const markdown = new Marked(markedKatex({ throwOnError: false, nonStandard: true }));

/** Makes a link or image path written relative to the note (e.g. `images/fig.png`) point at the real file. */
function resolve(href: string, base: string) {
  if (/^([a-z]+:|#|\/\/)/i.test(href)) return href;
  try {
    return new URL(href, new URL(base, window.location.href)).href;
  } catch {
    return href;
  }
}

/** Minutes to read at ~200 words a minute, ignoring code and maths. */
function readingMinutes(text: string) {
  const words = text.replace(/```[\s\S]*?```|\$\$[\s\S]*?\$\$/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function MarkdownViewer({ source, url, title }: { source: string; url: string; title: string }) {
  const html = useMemo(() => {
    const doc = new DOMParser().parseFromString(markdown.parse(source, { async: false }), 'text/html');
    doc.querySelectorAll('img[src]').forEach((img) => {
      img.setAttribute('src', resolve(img.getAttribute('src')!, url));
      img.setAttribute('loading', 'lazy');
    });
    doc.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href')!;
      if (href.startsWith('#')) return;
      a.setAttribute('href', resolve(href, url));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noreferrer');
    });
    // Wide tables scroll sideways on their own instead of stretching the page.
    doc.querySelectorAll('table').forEach((table) => {
      const wrap = doc.createElement('div');
      wrap.className = 'md-table';
      table.replaceWith(wrap);
      wrap.append(table);
    });
    // Label code blocks with their language (```c → "C").
    doc.querySelectorAll('pre > code[class*="language-"]').forEach((code) => {
      const lang = /language-([\w+#-]+)/.exec(code.className)?.[1];
      if (lang) code.parentElement!.dataset.lang = lang;
    });
    return doc.body.innerHTML;
  }, [source, url]);

  return (
    <div className="markdown-scroll">
      <div className="markdown-paper">
        <header className="markdown-meta">
          <span className="markdown-kind">Markdown note</span>
          <span className="markdown-title">{title.replace(/\.md$/i, '').replace(/[_-]+/g, ' ')}</span>
          <span className="markdown-time"><Clock size={12} /> {readingMinutes(source)} min read</span>
        </header>
        <article className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
