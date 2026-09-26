import { useSyncExternalStore } from 'react';

/**
 * "Buy me a Chiya" tip jar. Tips are paid directly through eSewa by scanning the QR; the site
 * only helps pick an amount and never handles money. Any component can open the tip jar.
 */

export const CUP_PRICE = 50; // Rs. per cup of chiya
export const CUP_PRESETS = [1, 2, 3, 5];
export const MAX_CUPS = 99;
export const ESEWA_NAME = 'Arpan Adhikari';
export const ESEWA_ID = '9864389333';
export const ESEWA_QR = `${import.meta.env.BASE_URL}esewa-qr.png`;

interface TipJarState {
  open: boolean;
  /** A small "found this useful?" prompt shown after a download (once per visit). */
  nudge: boolean;
}

let state: TipJarState = { open: false, nudge: false };
const listeners = new Set<() => void>();

function set(next: Partial<TipJarState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const openTipJar = () => set({ open: true, nudge: false });
export const closeTipJar = () => set({ open: false });
export const dismissTipNudge = () => set({ nudge: false });

const NUDGE_KEY = 'bece-notes:chiya-nudge-shown';

/** After a successful download, gently suggest a chiya — at most once per browser session. */
export function nudgeAfterDownload() {
  try {
    if (sessionStorage.getItem(NUDGE_KEY)) return;
    sessionStorage.setItem(NUDGE_KEY, '1');
  } catch {
    // Storage blocked: still show it, just not remembered.
  }
  set({ nudge: true });
}

export function useTipJar(): TipJarState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

export const formatRs = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;
