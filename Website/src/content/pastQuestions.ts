import { normalizeName, pastQuestionFolders, pastQuestionsFor, type NoteFile, type PastQuestionFolder, type Semester } from '@/content/notes';
import { semesters2025 } from '@/content/curriculum2025';
import type { Structure } from '@/content/structure';

/**
 * The subjects of a semester's Past Question Collection, for either curriculum order. Papers are filed
 * by subject; each before-2025 semester's collection lists its own subjects, so in the 2025 view a
 * subject's papers come from its before-2025 semester (e.g. 2025 Semester I's Applied Physics → Semester II).
 */
export interface PastQuestionSubject extends PastQuestionFolder {
  /** The before-2025 semester whose collection lists this subject's papers. */
  home: Semester;
  files: NoteFile[];
}

function folderFiles(home: Semester, folder: string) {
  const key = normalizeName(folder);
  return pastQuestionsFor(home)?.files.filter((f) => f.folder && normalizeName(f.folder.split('/')[0]) === key) ?? [];
}

export function pastQuestionSubjects(semester: Semester, structure: Structure): PastQuestionSubject[] {
  const term = Number(semester.id) % 2 ? 'Fall' : 'Spring';
  const entry = (f: PastQuestionFolder, home: Semester): PastQuestionSubject => {
    const files = folderFiles(home, f.folder);
    // The example's term follows the semester being viewed.
    return { ...f, home, files, papers: files.length, example: `2025_${term}_${f.short ?? '<Elective_Short>'}.pdf` };
  };
  if (structure === 'pre2025') return pastQuestionFolders(semester).map((f) => entry(f, semester));
  const sem2025 = semesters2025.find((s) => String(s.id) === semester.id);
  return (sem2025?.courses ?? []).flatMap((c) => {
    if (!c.subject || !c.noteSemester) return [];
    const key = normalizeName(c.subject.name);
    const folder = pastQuestionFolders(c.noteSemester).find((f) => normalizeName(f.folder) === key);
    return folder ? [entry(folder, c.noteSemester)] : [];
  });
}

/** How many papers a semester's collection shows in the given curriculum order. */
export const pastQuestionCount = (semester: Semester, structure: Structure) =>
  structure === 'pre2025'
    ? pastQuestionsFor(semester)?.files.length ?? 0
    : pastQuestionSubjects(semester, structure).reduce((a, s) => a + s.files.length, 0);
