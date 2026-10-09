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
  /** Files added per git author (from history at build time): notes and past question papers. */
  export const authors: { name: string; email: string; notes: number; pastQuestions: number }[];
}

interface ImportMetaEnv {
  /** Firebase Realtime Database URL used for the lifetime visit counter. */
  readonly VITE_FIREBASE_DB_URL?: string;
}
