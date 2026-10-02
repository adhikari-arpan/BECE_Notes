import { useSyncExternalStore } from 'react';
import { sessionStore } from '@/content/consent';

/**
 * "Buy me a Chiya" tip jar. Tips are paid directly through eSewa, Khalti or a bank transfer by
 * scanning a QR (or copying the details); the site only helps pick an amount and never handles
 * money. Any component can open the tip jar.
 */

export const CUP_PRICE = 50; // Rs. per cup of chiya
export const CUP_PRESETS = [1, 2, 3, 5];
export const MAX_CUPS = 99;
export const PAYEE_NAME = 'Arpan Adhikari';

export type PaymentMethodId = 'esewa' | 'khalti' | 'bank';

export interface PaymentMethod {
  id: PaymentMethodId;
  /** Tab label, e.g. "eSewa". */
  label: string;
  /** How the step list refers to the app, e.g. "eSewa" or "your bank app". */
  app: string;
  qr: string;
  qrFile: string;
  /** Details shown under the QR; `copy` marks the one with a copy button. */
  details: { label: string; value: string; copy?: boolean }[];
}

const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'esewa',
    label: 'eSewa',
    app: 'eSewa',
    qr: asset('images/payments/esewa-qr.png'),
    qrFile: 'esewa-qr-arpan-adhikari.png',
    details: [{ label: 'eSewa ID', value: '9864389333', copy: true }],
  },
  {
    id: 'khalti',
    label: 'Khalti',
    app: 'Khalti',
    qr: asset('images/payments/khalti-qr.png'),
    qrFile: 'khalti-qr-arpan-adhikari.png',
    details: [{ label: 'Khalti ID', value: '9864389333', copy: true }],
  },
  {
    id: 'bank',
    label: 'Bank transfer',
    app: 'your mobile banking app',
    qr: asset('images/payments/bank-qr.png'),
    qrFile: 'global-ime-bank-qr-arpan-adhikari.png',
    details: [
      { label: 'Bank', value: 'Global IME Bank Limited' },
      { label: 'Account name', value: 'Arpan Adhikari' },
      { label: 'Account number', value: '37707010011413', copy: true },
    ],
  },
];

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
  if (sessionStore.get(NUDGE_KEY)) return;
  sessionStore.set(NUDGE_KEY, '1');
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
