import { GRADES } from '@/content/grades';
import type { CurriculumSemesters, Entries } from '@/content/cgpa';
import { STRUCTURE_LABELS, type Structure } from '@/content/structure';

/**
 * "Custom" mode of the CGPA calculator: eight empty semesters where students add their own subjects
 * (name, credits, grade) — for other programs, other universities' courses, or anything not listed.
 * The data is turned into the same shape as a curriculum, so the calculator, summary and PDF all
 * work on it unchanged.
 */

export type CgpaMode = Structure | 'custom';

/** A batch year the calculator accepts (e.g. 2023), or null. */
export function parseBatch(text: string | null | undefined) {
  const n = Number(text);
  return text && /^\d{4}$/.test(text.trim()) && n >= 2000 && n <= 2100 ? n : null;
}

/**
 * The term a semester is named after, by the year it ENDS. A batch enrols at the end of its batch
 * year, so batch 2023: Semester I = Fall 2024, II = Spring 2024, III = Fall 2025, IV = Spring 2025, …
 */
export function termFor(batch: number | null, semesterId: number) {
  if (!batch) return null;
  const yearOffset = 1 + Math.floor((semesterId - 1) / 2);
  return `${semesterId % 2 === 1 ? 'Fall' : 'Spring'} ${batch + yearOffset}`;
}

export const MODE_LABELS: Record<CgpaMode, string> = { ...STRUCTURE_LABELS, custom: 'Custom' };

export interface CustomCourse {
  /** Stable key for the row (also its "code" in the calculator), e.g. "custom-k3j9". */
  id: string;
  name: string;
  /** As typed, so the box can be empty or mid-edit. */
  credits: string;
  grade: string;
}

export interface CustomSemester {
  courses: CustomCourse[];
  /** SGPA typed directly, as in the other modes. */
  sgpa: string;
  /** Semester credits, used only when an SGPA is typed without listing any subjects. */
  credits: string;
}

export type CustomData = Record<number, CustomSemester>;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const YEARS = ['Year I', 'Year I', 'Year II', 'Year II', 'Year III', 'Year III', 'Year IV', 'Year IV'];

export const CUSTOM_SEMESTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

export const emptyCustomSemester = (): CustomSemester => ({ courses: [], sgpa: '', credits: '' });

export const newCustomCourse = (): CustomCourse => ({
  id: `custom-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  credits: '',
  grade: '',
});

/** A positive credit value, or null while the box is empty or invalid. */
export function parseCredits(text: string) {
  const n = Number(text);
  return text.trim() !== '' && Number.isFinite(n) && n > 0 && n <= 30 ? n : null;
}

/** The custom subjects as a curriculum + entries, for computeResults, the summary and the PDF. */
export function customToCurriculum(data: CustomData): { sems: CurriculumSemesters; entries: Entries } {
  const entries: Entries = {};
  const sems: CurriculumSemesters = CUSTOM_SEMESTER_IDS.map((id, i) => {
    const sem = data[id] ?? emptyCustomSemester();
    const courses = sem.courses
      .map((c) => ({ code: c.id, name: c.name.trim() || 'Untitled subject', credits: parseCredits(c.credits) ?? 0 }))
      .filter((c) => c.credits > 0);
    // An SGPA typed with no subjects listed counts over the semester credits the student gave.
    const semCredits = parseCredits(sem.credits);
    if (!courses.length && sem.sgpa.trim() && semCredits) courses.push({ code: '__semester', name: 'Semester total', credits: semCredits });
    const grades: Record<string, string> = {};
    for (const c of sem.courses) if (c.grade) grades[c.id] = c.grade;
    entries[id] = { grades, electives: {}, sgpa: sem.sgpa };
    return { id, label: `Semester ${ROMAN[i]}`, year: YEARS[i], courses };
  });
  return { sems, entries };
}

export const hasCustomData = (data: CustomData) =>
  Object.values(data).some((s) => s.sgpa.trim() || s.courses.some((c) => c.name.trim() || c.credits.trim() || c.grade));

/** Keeps only valid, size-limited values (used for saved data and uploaded reports). */
export function cleanCustom(raw: unknown): CustomData {
  const out: CustomData = {};
  if (!raw || typeof raw !== 'object') return out;
  const letters = new Set<string>(GRADES.map((g) => g.letter));
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
  for (const id of CUSTOM_SEMESTER_IDS) {
    const v = (raw as Record<string, unknown>)[id] as Partial<Record<keyof CustomSemester, unknown>> | undefined;
    if (!v || typeof v !== 'object') continue;
    const courses = Array.isArray(v.courses) ? v.courses.slice(0, 20) : [];
    out[id] = {
      sgpa: str(v.sgpa, 8),
      credits: str(v.credits, 4),
      courses: courses
        .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
        .map((c) => ({
          id: /^custom-[a-z0-9]{1,12}$/.test(String(c.id)) ? String(c.id) : newCustomCourse().id,
          name: str(c.name, 80),
          credits: str(c.credits, 4),
          grade: letters.has(String(c.grade)) ? String(c.grade) : '',
        })),
    };
  }
  return out;
}
