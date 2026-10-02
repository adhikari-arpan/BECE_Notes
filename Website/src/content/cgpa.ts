import { curriculumSemesters } from '@/content/notes';
import { curriculumSemesters2025 } from '@/content/curriculum2025';
import { GRADES, gpa, gradePoint } from '@/content/grades';
import type { Structure } from '@/content/structure';

export type CurriculumSemesters = typeof curriculumSemesters;

/** The semesters and courses the calculator uses: the earlier order, or the 2025 one. */
export const curriculumFor = (structure: Structure): CurriculumSemesters =>
  structure === '2025' ? curriculumSemesters2025 : curriculumSemesters;

/** Per semester: grade picked for each course (by code), and/or a whole-semester SGPA typed in directly (it wins). */
export interface SemesterEntry {
  grades: Record<string, string>;
  electives: Record<string, string>;
  sgpa: string;
}
export type Entries = Record<number, SemesterEntry>;

export const emptyEntry = (): SemesterEntry => ({ grades: {}, electives: {}, sgpa: '' });

export const isElectiveSlot = (code: string) => /^ELEC\b/.test(code);

/** A typed SGPA counts only when it's a real value between 0 and 4. */
export function parseSgpa(text: string) {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 4 ? value : null;
}

export interface SemesterResult {
  id: number;
  totalCredits: number;
  /** Credits that count towards the CGPA (all of them when the SGPA was typed). */
  credits: number;
  sgpa: number | null;
  /** SGPA worked out from the subject grades alone. */
  fromGrades: number | null;
  typed: boolean;
  failed: number;
}

export function computeResults(entries: Entries, sems: CurriculumSemesters = curriculumSemesters) {
  const results: SemesterResult[] = sems.map((sem) => {
    const entry = entries[sem.id] ?? emptyEntry();
    const totalCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
    const graded = sem.courses
      .map((c) => ({ credits: c.credits, point: gradePoint(entry.grades[c.code] ?? '') }))
      .filter((c): c is { credits: number; point: number } => c.point !== undefined);
    const fromGrades = gpa(graded);
    // A typed SGPA (from the marksheet) counts over the whole semester's credits and replaces the subject grades.
    const typed = parseSgpa(entry.sgpa);
    if (typed !== null) return { id: sem.id, totalCredits, credits: totalCredits, sgpa: typed, fromGrades, typed: true, failed: 0 };
    return {
      id: sem.id,
      totalCredits,
      credits: graded.reduce((sum, c) => sum + c.credits, 0),
      sgpa: fromGrades,
      fromGrades,
      typed: false,
      failed: sem.courses.filter((c) => entry.grades[c.code] === 'F').length,
    };
  });
  const counted = results.filter((r) => r.sgpa !== null);
  return {
    results,
    counted,
    cgpa: gpa(counted.map((r) => ({ credits: r.credits, point: r.sgpa! }))),
    earned: counted.reduce((sum, r) => sum + r.credits, 0),
    programCredits: results.reduce((sum, r) => sum + r.totalCredits, 0),
    failed: results.reduce((sum, r) => sum + r.failed, 0),
    best: counted.length ? Math.max(...counted.map((r) => r.sgpa!)) : null,
  };
}

export const hasEntries = (entries: Entries) =>
  Object.values(entries).some((e) => e.sgpa || Object.values(e.grades).some(Boolean));

/**
 * Keeps only values the calculator understands: known semesters and courses, real grade letters,
 * short elective names and SGPA text. Used for saved data and uploaded reports alike.
 */
export function cleanEntries(raw: unknown, sems: CurriculumSemesters = curriculumSemesters): Entries {
  const out: Entries = {};
  if (!raw || typeof raw !== 'object') return out;
  const letters = new Set<string>(GRADES.map((g) => g.letter));
  for (const sem of sems) {
    const value = (raw as Record<string, unknown>)[sem.id];
    if (!value || typeof value !== 'object') continue;
    const v = value as Partial<Record<keyof SemesterEntry, unknown>>;
    const entry = emptyEntry();
    for (const c of sem.courses) {
      const grade = (v.grades as Record<string, unknown> | undefined)?.[c.code];
      if (typeof grade === 'string' && letters.has(grade)) entry.grades[c.code] = grade;
      const elective = (v.electives as Record<string, unknown> | undefined)?.[c.code];
      if (isElectiveSlot(c.code) && typeof elective === 'string') entry.electives[c.code] = elective.slice(0, 80);
    }
    if (typeof v.sgpa === 'string') entry.sgpa = v.sgpa.slice(0, 8);
    out[sem.id] = entry;
  }
  return out;
}
