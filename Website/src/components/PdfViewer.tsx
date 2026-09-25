import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Highlighter,
  Info,
  Maximize,
  Minimize,
  MonitorUp,
  Printer,
  RotateCw,
  Search,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { Loader } from '@/components/Loader';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** PDF points -> CSS pixels at 100% zoom (same convention as browser PDF viewers). */
const CSS_UNITS = 96 / 72;
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
const PAGE_GAP = 12;
const PADDING = 16;

type ZoomMode = 'fit-width' | 'fit-page' | 'custom';

/* ------------------------------------------------------------------ */
/* Highlights: stored per file in this browser's localStorage.         */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_COLORS = {
  yellow: '#ffd43b',
  green: '#69db7c',
  pink: '#f783ac',
  blue: '#4dabf7',
} as const;
type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

/** Rectangle as fractions (0–1) of the page at rotation 0, so it survives zoom and rotation. */
interface NormRect { x: number; y: number; w: number; h: number }

interface PdfHighlight {
  id: string;
  page: number;
  color: HighlightColor;
  rects: NormRect[];
  text?: string;
}

const HIGHLIGHT_KEY = (fileKey: string) => `bece-notes:highlights:${fileKey}`;
const STORAGE_NOTICE_KEY = 'bece-notes:highlight-notice-seen';
const STORAGE_NOTICE = 'Highlights are saved only in this browser\'s storage (cache) on this device. Clearing browser data, using private mode, or switching browser/device will lose them.';

function loadHighlights(fileKey: string): PdfHighlight[] {
  try {
    const raw = localStorage.getItem(HIGHLIGHT_KEY(fileKey));
    return raw ? (JSON.parse(raw) as PdfHighlight[]) : [];
  } catch {
    return [];
  }
}

function saveHighlights(fileKey: string, highlights: PdfHighlight[]) {
  try {
    if (highlights.length) localStorage.setItem(HIGHLIGHT_KEY(fileKey), JSON.stringify(highlights));
    else localStorage.removeItem(HIGHLIGHT_KEY(fileKey));
  } catch {
    // Storage full or blocked — highlights last until the page is closed.
  }
}

/** Point on the page at rotation 0 -> point as displayed at `rotation` (clockwise). */
function toDisplayed(u: number, v: number, rotation: number): [number, number] {
  if (rotation === 90) return [1 - v, u];
  if (rotation === 180) return [1 - u, 1 - v];
  if (rotation === 270) return [v, 1 - u];
  return [u, v];
}

/** Inverse of toDisplayed. */
function toBase(x: number, y: number, rotation: number): [number, number] {
  if (rotation === 90) return [y, 1 - x];
  if (rotation === 180) return [1 - x, 1 - y];
  if (rotation === 270) return [1 - y, x];
  return [x, y];
}

function mapRect(r: NormRect, rotation: number, map: typeof toBase): NormRect {
  const [x1, y1] = map(r.x, r.y, rotation);
  const [x2, y2] = map(r.x + r.w, r.y + r.h, rotation);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

type Popover =
  | { kind: 'selection'; x: number; y: number; pages: { page: number; rects: NormRect[] }[]; text: string }
  | { kind: 'existing'; x: number; y: number; id: string };

interface PdfViewerProps {
  url: string;
  fileName: string;
  /** Stable id for this file (repo path) — highlights are stored under it. */
  fileKey: string;
  onError: () => void;
}

/**
 * PDF viewer with browser-style controls: page navigation, zoom, fit width/page, rotation,
 * fullscreen, print, text selection/copy, search and highlights.
 * Pages are rendered lazily and released again when scrolled far away.
 */
export default function PdfViewer({ url, fileName, fileKey, onError }: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<[number, number][]>([]);
  const [progress, setProgress] = useState<number | null>(null);

  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-width');
  const [customZoom, setCustomZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [highlights, setHighlights] = useState<PdfHighlight[]>(() => loadHighlights(fileKey));
  const [penMode, setPenMode] = useState(false);
  const [penColor, setPenColor] = useState<HighlightColor>('yellow');
  const [popover, setPopover] = useState<Popover | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ page: number; hit: number }[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const textCache = useRef(new Map<number, string[]>());

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Page + position within it to restore after a zoom/rotate re-layout. */
  const anchorRef = useRef<{ page: number; fraction: number } | null>(null);

  // Load the document and every page's size (needed to lay out placeholders before rendering).
  useEffect(() => {
    setDoc(null);
    setProgress(null);
    textCache.current = new Map();
    const task = pdfjs.getDocument({ url });
    task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      if (total) setProgress(Math.round((loaded / total) * 100));
    };
    let cancelled = false;
    task.promise
      .then(async (pdf) => {
        const pages = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)));
        if (cancelled) return;
        setSizes(pages.map((p) => {
          const vp = p.getViewport({ scale: 1 });
          return [vp.width, vp.height];
        }));
        setDoc(pdf);
      })
      .catch(() => {
        if (!cancelled) onError();
      });
    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [url, onError]);

  useEffect(() => saveHighlights(fileKey, highlights), [fileKey, highlights]);

  // Track the scroll area's size for fit-width / fit-page.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewport({ width: el.clientWidth, height: el.clientHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [doc]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const rotated = rotation % 180 !== 0;
  const pageSize = (i: number): [number, number] => {
    const [w, h] = sizes[i] ?? sizes[0] ?? [612, 792];
    return rotated ? [h, w] : [w, h];
  };

  /** Fit modes size every page to the view on its own, so one odd-sized page doesn't skew the rest. */
  const zoomFor = (i: number) => {
    if (zoomMode === 'custom' || !viewport.width || !sizes.length) return customZoom;
    const [w, h] = pageSize(i);
    const fitWidth = (viewport.width - PADDING * 2) / (w * CSS_UNITS);
    if (zoomMode === 'fit-width') return fitWidth;
    return Math.min(fitWidth, (viewport.height - PADDING * 2) / (h * CSS_UNITS));
  };
  const zoom = zoomFor(currentPage - 1);

  const rememberPosition = () => {
    const scroller = scrollerRef.current;
    const el = pageRefs.current[currentPage - 1];
    if (!scroller || !el) return;
    anchorRef.current = { page: currentPage, fraction: (scroller.scrollTop - el.offsetTop) / el.offsetHeight };
  };

  // Keep the same spot in view after the layout changes size.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const scroller = scrollerRef.current;
    const el = anchor && pageRefs.current[anchor.page - 1];
    if (!anchor || !scroller || !el) return;
    scroller.scrollTop = el.offsetTop + anchor.fraction * el.offsetHeight;
    anchorRef.current = null;
  }, [zoom, rotation]);

  const setZoom = useCallback((mode: ZoomMode, value?: number) => {
    rememberPosition();
    setZoomMode(mode);
    if (value !== undefined) setCustomZoom(Math.min(5, Math.max(0.25, value)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const stepZoom = useCallback((direction: 1 | -1) => {
    const next = direction > 0
      ? ZOOM_STEPS.find((z) => z > zoom + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
      : [...ZOOM_STEPS].reverse().find((z) => z < zoom - 0.001) ?? ZOOM_STEPS[0];
    setZoom('custom', next);
  }, [zoom, setZoom]);

  // Ctrl/Cmd + mouse wheel zooms the document instead of the page.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      stepZoom(e.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [stepZoom, doc]);

  const onScroll = () => {
    setPopover(null);
    const scroller = scrollerRef.current;
    if (!scroller || !doc) return;
    const probe = scroller.scrollTop + scroller.clientHeight * 0.35;
    // Binary search for the last page starting above the probe line.
    let lo = 0;
    let hi = doc.numPages - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if ((pageRefs.current[mid]?.offsetTop ?? 0) <= probe) lo = mid;
      else hi = mid - 1;
    }
    if (lo + 1 !== currentPage) {
      setCurrentPage(lo + 1);
      setPageInput(String(lo + 1));
    }
  };

  const goToPage = useCallback((n: number) => {
    if (!doc) return;
    const page = Math.min(doc.numPages, Math.max(1, Math.round(n)));
    const el = pageRefs.current[page - 1];
    if (el && scrollerRef.current) scrollerRef.current.scrollTop = el.offsetTop - PADDING;
    setCurrentPage(page);
    setPageInput(String(page));
  }, [doc]);

  const onPageInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const n = Number(pageInput);
      // Keep focus: blurring here would reset the box with the pre-navigation page number.
      if (pageInput && Number.isFinite(n)) goToPage(n);
      else setPageInput(String(currentPage));
    }
    if (e.key === 'Escape') {
      setPageInput(String(currentPage));
      e.currentTarget.blur();
    }
  };

  const rotate = () => {
    rememberPosition();
    setPopover(null);
    setRotation((r) => (r + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen();
  };

  const pdfBlobUrl = async () => {
    const data = await doc!.getData();
    return URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/pdf' }));
  };

  /** Opens the file in the browser's built-in PDF viewer. */
  const openNative = async () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.title = fileName;
    win.location.href = await pdfBlobUrl();
  };

  const print = async () => {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    frame.src = await pdfBlobUrl();
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    };
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 60_000);
  };

  /* ---------------------------- Search ---------------------------- */

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.select());
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setSearchResults([]);
  };

  // Search every page's text (fetched once and cached), debounced while typing.
  useEffect(() => {
    if (!doc) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      const results: { page: number; hit: number }[] = [];
      for (let p = 1; p <= doc.numPages; p++) {
        let items = textCache.current.get(p);
        if (!items) {
          const content = await (await doc.getPage(p)).getTextContent();
          items = content.items.map((it) => ('str' in it ? it.str : ''));
          textCache.current.set(p, items);
        }
        if (cancelled) return;
        let hit = 0;
        for (const s of items) if (s.toLowerCase().includes(q)) results.push({ page: p, hit: hit++ });
      }
      setSearchResults(results);
      setSearching(false);
      const first = results.findIndex((r) => r.page >= currentPage);
      setSearchIndex(first === -1 ? 0 : first);
      if (results.length) goToPage(results[first === -1 ? 0 : first].page);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  // Re-run only when the query or document changes, not on every scroll.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, doc]);

  const stepSearch = (dir: 1 | -1) => {
    if (!searchResults.length) return;
    const next = (searchIndex + dir + searchResults.length) % searchResults.length;
    setSearchIndex(next);
    goToPage(searchResults[next].page);
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') stepSearch(e.shiftKey ? -1 : 1);
    if (e.key === 'Escape') closeSearch();
  };

  // Ctrl/Cmd + F inside the viewer opens this search instead of the browser's.
  const onViewerKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openSearch();
    }
  };

  /* -------------------------- Highlights -------------------------- */

  const showStorageNoticeOnce = () => {
    try {
      if (localStorage.getItem(STORAGE_NOTICE_KEY)) return;
      localStorage.setItem(STORAGE_NOTICE_KEY, '1');
    } catch {
      // Storage blocked: highlights won't persist at all, so say so every time.
    }
    setNotice(STORAGE_NOTICE);
  };

  const addHighlight = (page: number, rects: NormRect[], color: HighlightColor, text?: string) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setHighlights((prev) => [...prev, { id, page, color, rects, text }]);
    showStorageNoticeOnce();
  };

  const removeHighlight = (id: string) => setHighlights((prev) => prev.filter((h) => h.id !== id));

  /** Viewer-relative position for the popover, from viewport (client) coordinates. */
  const toRootPoint = (clientX: number, clientY: number) => {
    const box = rootRef.current!.getBoundingClientRect();
    return { x: Math.min(Math.max(clientX - box.left, 110), box.width - 110), y: clientY - box.top };
  };

  // After selecting text, offer copy + highlight near the end of the selection.
  const onPointerUp = () => {
    if (penMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!scrollerRef.current?.contains(range.commonAncestorContainer)) return;
    const text = sel.toString().trim();
    if (!text) return;

    const byPage = new Map<number, NormRect[]>();
    const pageBoxes = pageRefs.current.map((el) => el?.getBoundingClientRect() ?? null);
    for (const r of Array.from(range.getClientRects())) {
      if (r.width < 1 || r.height < 1) continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const idx = pageBoxes.findIndex((b) => b && cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom);
      if (idx === -1) continue;
      const b = pageBoxes[idx]!;
      const shown = { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width / b.width, h: r.height / b.height };
      byPage.set(idx + 1, [...(byPage.get(idx + 1) ?? []), mapRect(shown, rotation, toBase)]);
    }
    if (!byPage.size) return;
    const last = range.getBoundingClientRect();
    const at = toRootPoint(last.left + last.width / 2, last.bottom);
    setPopover({ kind: 'selection', ...at, pages: [...byPage].map(([page, rects]) => ({ page, rects })), text });
  };

  const highlightSelection = (color: HighlightColor) => {
    if (popover?.kind !== 'selection') return;
    popover.pages.forEach(({ page, rects }) => addHighlight(page, rects, color, popover.text));
    window.getSelection()?.removeAllRanges();
    setPopover(null);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      document.execCommand('copy');
    }
    window.getSelection()?.removeAllRanges();
    setPopover(null);
  };

  const pageHighlights = useMemo(() => {
    const map = new Map<number, PdfHighlight[]>();
    for (const h of highlights) map.set(h.page, [...(map.get(h.page) ?? []), h]);
    return map;
  }, [highlights]);

  if (!doc) {
    return (
      <div className="pdf-loading">
        <Loader label="Loading PDF…" progress={progress} />
      </div>
    );
  }

  const zoomSelectValue = zoomMode === 'custom' ? String(customZoom) : zoomMode;
  const current = searchResults[searchIndex];
  const existing = popover?.kind === 'existing' ? highlights.find((h) => h.id === popover.id) : undefined;

  return (
    <div className={`pdf-viewer ${penMode ? 'pen-mode' : ''}`} ref={rootRef} onKeyDown={onViewerKey}>
      <div className="pdf-toolbar" role="toolbar" aria-label="PDF controls">
        <div className="pdf-toolbar-group">
          <button className="pdf-tool pdf-tool-optional" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} title="Previous page">
            <ChevronUp size={16} />
          </button>
          <button className="pdf-tool pdf-tool-optional" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= doc.numPages} title="Next page">
            <ChevronDown size={16} />
          </button>
          <label className="pdf-page-input" title="Go to page (type a number and press Enter)">
            <input
              value={pageInput}
              inputMode="numeric"
              aria-label="Page number"
              onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
              onKeyDown={onPageInputKey}
              onBlur={() => setPageInput(String(currentPage))}
              onFocus={(e) => e.target.select()}
            />
            <span>/ {doc.numPages}</span>
          </label>
        </div>

        <div className="pdf-toolbar-group">
          <button className="pdf-tool" onClick={() => stepZoom(-1)} disabled={zoom <= ZOOM_STEPS[0] + 0.001} title="Zoom out (Ctrl + scroll)">
            <ZoomOut size={16} />
          </button>
          <select
            className="pdf-zoom-select"
            value={zoomSelectValue}
            aria-label="Zoom"
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'fit-width' || v === 'fit-page') setZoom(v);
              else setZoom('custom', Number(v));
            }}
          >
            <option value="fit-width">Fit to width{zoomMode === 'fit-width' ? ` (${Math.round(zoom * 100)}%)` : ''}</option>
            <option value="fit-page">Fit to page{zoomMode === 'fit-page' ? ` (${Math.round(zoom * 100)}%)` : ''}</option>
            {zoomMode === 'custom' && !ZOOM_STEPS.includes(customZoom) && (
              <option value={String(customZoom)}>{Math.round(customZoom * 100)}%</option>
            )}
            {ZOOM_STEPS.map((z) => <option key={z} value={String(z)}>{Math.round(z * 100)}%</option>)}
          </select>
          <button className="pdf-tool" onClick={() => stepZoom(1)} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.001} title="Zoom in (Ctrl + scroll)">
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="pdf-toolbar-group">
          <button className={`pdf-tool ${searchOpen ? 'active' : ''}`} onClick={() => (searchOpen ? closeSearch() : openSearch())} title="Search in document (Ctrl + F)">
            <Search size={16} />
          </button>
          <button
            className={`pdf-tool ${penMode ? 'active' : ''}`}
            onClick={() => { setPenMode((m) => !m); setPopover(null); }}
            title="Highlighter pen: drag over any area (works on scanned/handwritten notes too)"
          >
            <Highlighter size={16} />
          </button>
          <button className="pdf-tool" onClick={rotate} title="Rotate clockwise">
            <RotateCw size={16} />
          </button>
          <button className="pdf-tool" onClick={toggleFullscreen} title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button className="pdf-tool pdf-tool-optional" onClick={print} title="Print">
            <Printer size={16} />
          </button>
          <button className="pdf-tool pdf-tool-optional" onClick={openNative} title="Open in browser's PDF viewer">
            <MonitorUp size={16} />
          </button>
        </div>
      </div>

      {(searchOpen || penMode) && (
        <div className="pdf-subbar">
          {searchOpen && (
            <div className="pdf-search">
              <Search size={14} />
              <input
                ref={searchInputRef}
                autoFocus
                value={query}
                placeholder="Find in document…"
                aria-label="Find in document"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
              <span className="pdf-search-count">
                {searching ? 'Searching…' : query.trim() ? (searchResults.length ? `${searchIndex + 1} / ${searchResults.length}` : 'No matches') : ''}
              </span>
              <button className="pdf-tool" onClick={() => stepSearch(-1)} disabled={!searchResults.length} title="Previous match (Shift + Enter)"><ChevronUp size={15} /></button>
              <button className="pdf-tool" onClick={() => stepSearch(1)} disabled={!searchResults.length} title="Next match (Enter)"><ChevronDown size={15} /></button>
              <button className="pdf-tool" onClick={closeSearch} title="Close search (Esc)"><X size={15} /></button>
            </div>
          )}
          {penMode && (
            <div className="pdf-pen">
              <span>Drag over the page to highlight</span>
              {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  className={`swatch ${penColor === c ? 'selected' : ''}`}
                  style={{ background: HIGHLIGHT_COLORS[c] }}
                  onClick={() => setPenColor(c)}
                  aria-label={`${c} highlighter`}
                  title={c}
                />
              ))}
              <span className="pdf-storage-hint" title={STORAGE_NOTICE}><Info size={12} /> Saved in this browser only</span>
            </div>
          )}
        </div>
      )}

      <div className="pdf-scroller" ref={scrollerRef} onScroll={onScroll} onPointerDown={() => setPopover(null)} onPointerUp={onPointerUp} tabIndex={0}>
        <div className="pdf-pages" style={{ gap: PAGE_GAP, padding: PADDING }}>
          {Array.from({ length: doc.numPages }, (_, i) => {
            const [w, h] = pageSize(i);
            const pageZoom = zoomFor(i);
            return (
              <PdfPage
                key={i}
                setRef={(el) => { pageRefs.current[i] = el; }}
                doc={doc}
                pageNumber={i + 1}
                width={w * CSS_UNITS * pageZoom}
                height={h * CSS_UNITS * pageZoom}
                zoom={pageZoom}
                rotation={rotation}
                root={scrollerRef}
                highlights={pageHighlights.get(i + 1)}
                penMode={penMode}
                penColor={penColor}
                onDraw={(rect) => addHighlight(i + 1, [mapRect(rect, rotation, toBase)], penColor)}
                onHighlightClick={(id, clientX, clientY) => setPopover({ kind: 'existing', id, ...toRootPoint(clientX, clientY) })}
                query={searchOpen ? query.trim().toLowerCase() : ''}
                currentHit={current && current.page === i + 1 ? current.hit : -1}
              />
            );
          })}
        </div>
      </div>

      {popover && (
        <div className="pdf-popover" style={{ left: popover.x, top: popover.y + 8 }} onPointerDown={(e) => e.stopPropagation()}>
          {popover.kind === 'selection' ? (
            <>
              <button className="pdf-popover-btn" onClick={() => copyText(popover.text)}><Copy size={14} /> Copy</button>
              <span className="pdf-popover-sep" />
              {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((c) => (
                <button key={c} className="swatch" style={{ background: HIGHLIGHT_COLORS[c] }} onClick={() => highlightSelection(c)} aria-label={`Highlight ${c}`} title={`Highlight ${c}`} />
              ))}
            </>
          ) : existing ? (
            <>
              {existing.text && <button className="pdf-popover-btn" onClick={() => copyText(existing.text!)}><Copy size={14} /> Copy</button>}
              {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  className={`swatch ${existing.color === c ? 'selected' : ''}`}
                  style={{ background: HIGHLIGHT_COLORS[c] }}
                  onClick={() => { setHighlights((prev) => prev.map((h) => (h.id === existing.id ? { ...h, color: c } : h))); setPopover(null); }}
                  aria-label={`Change to ${c}`}
                  title={`Change to ${c}`}
                />
              ))}
              <span className="pdf-popover-sep" />
              <button className="pdf-popover-btn danger" onClick={() => { removeHighlight(existing.id); setPopover(null); }}><Trash2 size={14} /> Remove</button>
            </>
          ) : null}
          <div className="pdf-popover-note"><Info size={11} /> Highlights are saved in this browser only</div>
        </div>
      )}

      {notice && (
        <div className="pdf-notice" role="status">
          <Info size={16} />
          <p>{notice}</p>
          <button className="pdf-tool" onClick={() => setNotice(null)} aria-label="Dismiss"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

interface PdfPageProps {
  setRef: (el: HTMLDivElement | null) => void;
  doc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  height: number;
  zoom: number;
  rotation: number;
  root: RefObject<HTMLDivElement>;
  highlights?: PdfHighlight[];
  penMode: boolean;
  penColor: HighlightColor;
  /** Rectangle drawn with the pen, as fractions of the page as currently displayed. */
  onDraw: (rect: NormRect) => void;
  onHighlightClick: (id: string, clientX: number, clientY: number) => void;
  query: string;
  currentHit: number;
}

function PdfPage({
  setRef, doc, pageNumber, width, height, zoom, rotation, root,
  highlights, penMode, penColor, onDraw, onHighlightClick, query, currentHit,
}: PdfPageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textDivsRef = useRef<HTMLElement[]>([]);
  const [visible, setVisible] = useState(false);
  const [textVersion, setTextVersion] = useState(0);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      root: root.current,
      rootMargin: '1200px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  // Debounce so rapid zoom clicks don't queue a render per step.
  const [renderZoom, setRenderZoom] = useState(zoom);
  useEffect(() => {
    const t = setTimeout(() => setRenderZoom(zoom), 120);
    return () => clearTimeout(t);
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    if (!canvas || !textEl) return;
    if (!visible) {
      // Free memory for pages far off-screen.
      canvas.width = 0;
      canvas.height = 0;
      textEl.replaceChildren();
      textDivsRef.current = [];
      return;
    }
    let cancelled = false;
    let task: RenderTask | null = null;
    let textLayer: pdfjs.TextLayer | null = null;
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const rot = (page.rotate + rotation) % 360;
      const scale = renderZoom * CSS_UNITS * Math.min(window.devicePixelRatio || 1, 2);
      const vp = page.getViewport({ scale, rotation: rot });
      // Cap canvas size so very high zoom levels don't exhaust memory.
      const cap = Math.min(1, Math.sqrt(16_000_000 / (vp.width * vp.height)));
      const finalVp = cap < 1 ? page.getViewport({ scale: scale * cap, rotation: rot }) : vp;
      const off = document.createElement('canvas');
      off.width = Math.floor(finalVp.width);
      off.height = Math.floor(finalVp.height);
      task = page.render({ canvas: off, viewport: finalVp });
      task.promise
        .then(() => {
          if (cancelled) return;
          // Swap in the finished render in one go (no blank flash while zooming).
          canvas.width = off.width;
          canvas.height = off.height;
          canvas.getContext('2d')?.drawImage(off, 0, 0);
        })
        .catch(() => {});

      // Invisible, selectable text laid over the canvas (select, copy, search).
      const cssVp = page.getViewport({ scale: renderZoom * CSS_UNITS, rotation: rot });
      textEl.style.setProperty('--scale-factor', String(cssVp.scale));
      textEl.style.setProperty('--total-scale-factor', String(cssVp.scale));
      textEl.replaceChildren();
      textLayer = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: textEl, viewport: cssVp });
      textLayer.render()
        .then(() => {
          if (cancelled || !textLayer) return;
          textDivsRef.current = textLayer.textDivs;
          setTextVersion((v) => v + 1);
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
      task?.cancel();
      textLayer?.cancel();
    };
  }, [visible, doc, pageNumber, renderZoom, rotation]);

  // Mark search matches in the text layer; bring the current one into view.
  useEffect(() => {
    let hit = 0;
    for (const div of textDivsRef.current) {
      const match = !!query && (div.textContent ?? '').toLowerCase().includes(query);
      div.classList.toggle('search-hit', match);
      const isCurrent = match && hit === currentHit;
      div.classList.toggle('search-hit-current', isCurrent);
      if (isCurrent) div.scrollIntoView({ block: 'center', inline: 'nearest' });
      if (match) hit++;
    }
  }, [query, currentHit, textVersion]);

  const pointerPos = (e: PointerEvent) => {
    const b = wrapRef.current!.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), y: Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)) };
  };

  const onPenDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pointerPos(e);
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };
  const onPenMove = (e: PointerEvent) => {
    if (!draft) return;
    const p = pointerPos(e);
    setDraft({ ...draft, x1: p.x, y1: p.y });
  };
  const onPenUp = () => {
    if (!draft) return;
    const rect = { x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1), w: Math.abs(draft.x1 - draft.x0), h: Math.abs(draft.y1 - draft.y0) };
    setDraft(null);
    if (rect.w > 0.005 && rect.h > 0.003) onDraw(rect);
  };

  // Clicking a highlight (outside pen mode, with no text being selected) opens its menu.
  const onPageClick = (e: MouseEvent) => {
    if (penMode || !highlights?.length) return;
    if (!window.getSelection()?.isCollapsed) return;
    const b = wrapRef.current!.getBoundingClientRect();
    const [u, v] = toBase((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height, rotation);
    const hitHighlight = [...highlights].reverse().find((h) => h.rects.some((r) => u >= r.x && u <= r.x + r.w && v >= r.y && v <= r.y + r.h));
    if (hitHighlight) onHighlightClick(hitHighlight.id, e.clientX, e.clientY);
  };

  return (
    <div
      ref={(el) => { wrapRef.current = el; setRef(el); }}
      className="pdf-page"
      style={{ width, height }}
      onClick={onPageClick}
    >
      <canvas ref={canvasRef} aria-label={`Page ${pageNumber}`} />
      <div className="pdf-highlight-layer" aria-hidden="true">
        {highlights?.flatMap((h) =>
          h.rects.map((r, i) => {
            const d = mapRect(r, rotation, toDisplayed);
            return (
              <div
                key={`${h.id}-${i}`}
                className="pdf-highlight"
                style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%`, width: `${d.w * 100}%`, height: `${d.h * 100}%`, background: HIGHLIGHT_COLORS[h.color] }}
              />
            );
          }),
        )}
        {draft && (
          <div
            className="pdf-highlight draft"
            style={{
              left: `${Math.min(draft.x0, draft.x1) * 100}%`,
              top: `${Math.min(draft.y0, draft.y1) * 100}%`,
              width: `${Math.abs(draft.x1 - draft.x0) * 100}%`,
              height: `${Math.abs(draft.y1 - draft.y0) * 100}%`,
              background: HIGHLIGHT_COLORS[penColor],
            }}
          />
        )}
      </div>
      <div ref={textRef} className="textLayer" />
      {penMode && <div className="pdf-pen-layer" onPointerDown={onPenDown} onPointerMove={onPenMove} onPointerUp={onPenUp} />}
      <span className="pdf-page-number">{pageNumber} / {doc.numPages}</span>
    </div>
  );
}
