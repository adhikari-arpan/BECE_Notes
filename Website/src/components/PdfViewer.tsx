import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import {
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  MonitorUp,
  Printer,
  RotateCw,
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

interface PdfViewerProps {
  url: string;
  fileName: string;
  onError: () => void;
}

/**
 * PDF viewer with browser-style controls: page navigation, zoom, fit width/page,
 * rotation, fullscreen, print and "open in the browser's PDF viewer".
 * Pages are rendered lazily and released again when scrolled far away.
 */
export default function PdfViewer({ url, fileName, onError }: PdfViewerProps) {
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

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Page + position within it to restore after a zoom/rotate re-layout. */
  const anchorRef = useRef<{ page: number; fraction: number } | null>(null);

  // Load the document and every page's size (needed to lay out placeholders before rendering).
  useEffect(() => {
    setDoc(null);
    setProgress(null);
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

  const goToPage = (n: number) => {
    if (!doc) return;
    const page = Math.min(doc.numPages, Math.max(1, Math.round(n)));
    const el = pageRefs.current[page - 1];
    if (el && scrollerRef.current) scrollerRef.current.scrollTop = el.offsetTop - PADDING;
    setCurrentPage(page);
    setPageInput(String(page));
  };

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

  /** Opens the file in the browser's built-in PDF viewer (search, text selection, annotations...). */
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

  if (!doc) {
    return (
      <div className="pdf-loading">
        <Loader label="Loading PDF…" progress={progress} />
      </div>
    );
  }

  const zoomSelectValue = zoomMode === 'custom' ? String(customZoom) : zoomMode;

  return (
    <div className="pdf-viewer" ref={rootRef}>
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
          <button className="pdf-tool" onClick={rotate} title="Rotate clockwise">
            <RotateCw size={16} />
          </button>
          <button className="pdf-tool" onClick={toggleFullscreen} title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button className="pdf-tool pdf-tool-optional" onClick={print} title="Print">
            <Printer size={16} />
          </button>
          <button className="pdf-tool" onClick={openNative} title="Open in browser's PDF viewer (search, select text)">
            <MonitorUp size={16} />
          </button>
        </div>
      </div>

      <div className="pdf-scroller" ref={scrollerRef} onScroll={onScroll} tabIndex={0}>
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
              />
            );
          })}
        </div>
      </div>
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
}

function PdfPage({ setRef, doc, pageNumber, width, height, zoom, rotation, root }: PdfPageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

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
    if (!canvas) return;
    if (!visible) {
      // Free memory for pages far off-screen.
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    let cancelled = false;
    let task: RenderTask | null = null;
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const scale = renderZoom * CSS_UNITS * Math.min(window.devicePixelRatio || 1, 2);
      const vp = page.getViewport({ scale, rotation: (page.rotate + rotation) % 360 });
      // Cap canvas size so very high zoom levels don't exhaust memory.
      const cap = Math.min(1, Math.sqrt(16_000_000 / (vp.width * vp.height)));
      const finalVp = cap < 1 ? page.getViewport({ scale: scale * cap, rotation: (page.rotate + rotation) % 360 }) : vp;
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
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [visible, doc, pageNumber, renderZoom, rotation]);

  return (
    <div
      ref={(el) => { wrapRef.current = el; setRef(el); }}
      className="pdf-page"
      style={{ width, height }}
    >
      <canvas ref={canvasRef} aria-label={`Page ${pageNumber}`} />
      <span className="pdf-page-number">{pageNumber} / {doc.numPages}</span>
    </div>
  );
}
