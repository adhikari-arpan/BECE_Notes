import { useSyncExternalStore } from 'react';
import { deviceStore } from '@/content/consent';

/**
 * Which curriculum order the visitor follows: the earlier one (batches before 2025, how the notes
 * are organised) or the 2025 one (same subjects, different semesters). Remembered with cookie
 * consent, otherwise for this visit.
 */
export type Structure = 'pre2025' | '2025';

const STORAGE_KEY = 'bece-notes:structure';
const listeners = new Set<() => void>();

export const STRUCTURE_LABELS: Record<Structure, string> = {
  pre2025: 'Before 2025 batch',
  '2025': '2025 batch onwards',
};

export function getStructure(): Structure {
  return deviceStore.get(STORAGE_KEY) === '2025' ? '2025' : 'pre2025';
}

export function setStructure(structure: Structure) {
  deviceStore.set(STORAGE_KEY, structure);
  listeners.forEach((l) => l());
}

export function useStructure(): Structure {
  return useSyncExternalStore((l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, getStructure);
}
