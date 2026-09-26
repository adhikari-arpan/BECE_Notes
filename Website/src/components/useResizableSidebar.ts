import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * VS Code-style sidebar: drag the edge to resize, drag it narrow to snap it closed, double-click
 * the edge to reset, Ctrl/Cmd + B to toggle. Width and collapsed state are remembered per browser.
 */

const STORAGE_KEY = 'bece-notes:sidebar';
export const SIDEBAR_DEFAULT = 280;
const MIN = 180;
const MAX = 640;
/** Dragging narrower than this snaps the sidebar closed (and wider reopens it). */
const SNAP = 120;
const KEY_STEP = 16;

interface SidebarState { width: number; collapsed: boolean }

function load(): SidebarState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<SidebarState> | null;
    return {
      width: Math.min(MAX, Math.max(MIN, Number(saved?.width) || SIDEBAR_DEFAULT)),
      collapsed: saved?.collapsed === true,
    };
  } catch {
    return { width: SIDEBAR_DEFAULT, collapsed: false };
  }
}

export function useResizableSidebar() {
  const [state, setState] = useState<SidebarState>(load);
  const [dragging, setDragging] = useState(false);
  /** Left edge of the sidebar in viewport coordinates, captured when a drag starts. */
  const originRef = useRef(0);
  /** Width when the drag started — restored if the drag ends up snapping the sidebar closed. */
  const startWidthRef = useRef(SIDEBAR_DEFAULT);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage blocked — the layout still works, it just isn't remembered.
    }
  }, [state]);

  const toggle = useCallback(() => setState((s) => ({ ...s, collapsed: !s.collapsed })), []);

  // Ctrl/Cmd + B toggles the sidebar, like VS Code (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'b' || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  // While dragging, keep the resize cursor everywhere and stop text from being selected.
  useEffect(() => {
    document.body.classList.toggle('is-resizing-sidebar', dragging);
    return () => document.body.classList.remove('is-resizing-sidebar');
  }, [dragging]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const container = e.currentTarget.parentElement!.getBoundingClientRect();
    originRef.current = container.left;
    startWidthRef.current = state.width;
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const raw = e.clientX - originRef.current;
    if (raw < SNAP) setState({ width: startWidthRef.current, collapsed: true });
    else setState({ width: Math.round(Math.min(MAX, Math.max(MIN, raw))), collapsed: false });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowLeft' ? -KEY_STEP : KEY_STEP;
      setState((s) => ({ collapsed: false, width: Math.min(MAX, Math.max(MIN, s.width + delta)) }));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  const reset = () => setState({ width: SIDEBAR_DEFAULT, collapsed: false });

  return {
    width: state.width,
    collapsed: state.collapsed,
    dragging,
    toggle,
    handleProps: {
      role: 'separator',
      'aria-orientation': 'vertical' as const,
      'aria-label': 'Resize file list (drag, or use arrow keys)',
      'aria-valuemin': MIN,
      'aria-valuemax': MAX,
      'aria-valuenow': state.collapsed ? 0 : state.width,
      tabIndex: 0,
      title: 'Drag to resize · double-click to reset',
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick: reset,
      onKeyDown,
    },
  };
}
