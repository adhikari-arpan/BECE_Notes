/// <reference types="vite/client" />

declare module 'virtual:notes-manifest' {
  export interface ManifestEntry {
    path: string;
    size: number;
    updated: string | null;
    lfs: boolean;
  }
  export const config: { fileBase: string; lfsBase: string };
  export const entries: ManifestEntry[];
}

interface ImportMetaEnv {
  /** Firebase Realtime Database URL used for the lifetime visit counter. */
  readonly VITE_FIREBASE_DB_URL?: string;
}
