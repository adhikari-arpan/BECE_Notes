import { config, entries, type ManifestEntry } from 'virtual:notes-manifest';
import { subjectDescriptions } from '@/content/descriptions';
import { subjectUnits, type SubjectUnit } from '@/content/subjectUnits';
import {
  ASSESSMENTS_FOLDER,
  PAST_PAPER_SHORT,
  PAST_QUESTIONS_FOLDER,
  SUBJECTS_ROOT,
  curriculum,
  electiveCourses,
  legacyFolder,
  subjectFolder,
  type CourseInfo,
} from '@/content/curriculumData';

export type FileKind = 'pdf' | 'doc' | 'slides' | 'sheet' | 'image' | 'markdown' | 'code' | 'text' | 'other';

export interface NoteFile {
  id: string;
  name: string;
  /** Repo-relative path, e.g. `Subjects/Database Management System/NCIT Notes/Unit 1.pdf`. */
  path: string;
  /** Sub-folder inside the subject folder ('' for files at the subject root). */
  folder: string;
  kind: FileKind;
  size: number;
  updated: string | null;
  /** Direct URL to the file contents (local in dev, GitHub in production). */
  url: string;
}

export interface Subject {
  id: string;
  /** URL part, e.g. `programming-in-c` in /semester-1/programming-in-c. */
  slug: string;
  /** course = curriculum subject, syllabus = the semester's `_Syllabus` folder, resource = anything else. */
  kind: 'course' | 'syllabus' | 'resource';
  code: string;
  name: string;
  credits: number | null;
  /** Short summary of what the course covers (see descriptions.ts). */
  description?: string;
  /** The units of its Pokhara University syllabus (see subjectUnits.ts). */
  units?: readonly SubjectUnit[];
  /** An "Elective I/II/III" slot: its notes live in the Electives collection, not in the semester. */
  electiveSlot?: boolean;
  icon: string;
  /** Repo folder holding this subject's notes, or null if nothing has been added yet. */
  folder: string | null;
  files: NoteFile[];
}

export interface Semester {
  id: string;
  /** URL part, e.g. `semester-1` or `electives`. */
  slug: string;
  /** Short badge shown on the home page, e.g. `01` or `EL`. */
  badge: string;
  year: string;
  label: string;
  subjects: Subject[];
}

/** The curriculum without notes: every semester's courses with codes and credits (used by the CGPA calculator). */
export const curriculumSemesters = curriculum.map((s) => ({
  id: s.id,
  label: s.label,
  year: s.year,
  courses: s.courses.map(({ code, name, credits }) => ({ code, name, credits: credits ?? 0 })),
}));

/** Elective subjects a student can pick for an Elective I/II/III slot. */
export const electiveNames = electiveCourses.map((c) => c.name);

/** Folders holding shared material rather than a single subject (Question Collection, _Syllabus, ...). */
const resourceIcons: [RegExp, string][] = [
  [/syllabus/i, '§'],
  [/question|assessment/i, '✎'],
];

const EXTENSION_KINDS: Record<string, FileKind> = {
  pdf: 'pdf',
  doc: 'doc', docx: 'doc',
  ppt: 'slides', pptx: 'slides',
  xls: 'sheet', xlsx: 'sheet', csv: 'sheet',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image',
  md: 'markdown',
  c: 'code', cpp: 'code', h: 'code', py: 'code', java: 'code', js: 'code', vhdl: 'code', ipynb: 'code', sql: 'code', m: 'code',
  txt: 'text',
};

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

function toNoteFile(entry: ManifestEntry, subjectRoot: string): NoteFile {
  const name = entry.path.slice(entry.path.lastIndexOf('/') + 1);
  const inner = entry.path.slice(subjectRoot.length + 1);
  const folder = inner.includes('/') ? inner.slice(0, inner.lastIndexOf('/')) : '';
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  return {
    id: entry.path,
    name,
    path: entry.path,
    folder,
    kind: EXTENSION_KINDS[ext] ?? 'other',
    size: entry.size,
    updated: entry.updated,
    url: (entry.lfs ? config.lfsBase : config.fileBase) + encodePath(entry.path),
  };
}

/** Groups manifest entries under `<root>/` by their first folder; files directly in `<root>` go under ''. */
function groupByFolder(root: string): Map<string, NoteFile[]> {
  const groups = new Map<string, NoteFile[]>();
  for (const entry of entries) {
    if (!entry.path.startsWith(root + '/')) continue;
    const rest = entry.path.slice(root.length + 1);
    const folder = rest.includes('/') ? rest.slice(0, rest.indexOf('/')) : '';
    const file = toNoteFile(entry, folder ? `${root}/${folder}` : root);
    groups.set(folder, [...(groups.get(folder) ?? []), file]);
  }
  return groups;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Folder/course names compared loosely: "Programming in C" = "programming-in-c", "&" = "and". */
export const normalizeName = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

const descriptionsByName = new Map(Object.entries(subjectDescriptions).map(([name, text]) => [normalizeName(name), text]));
const descriptionFor = (name: string) => descriptionsByName.get(normalizeName(name));
const unitsByName = new Map(Object.entries(subjectUnits).map(([name, units]) => [normalizeName(name), units]));
const unitsFor = (name: string) => unitsByName.get(normalizeName(name));

/* --------------------------- Subjects/ (notes) --------------------------- */

/** True for a file inside a subject's own `_Syllabus` (or `Syllabus`) folder. */
export const isSyllabusFolder = (folder: string) => normalizeName(folder.split('/')[0]) === 'syllabus';

/** Name key for syllabus matching: ignores filler words and "syllabus"/"final"/"new" in file names. */
const SYLLABUS_NOISE = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'with', 'for', 'to', 'syllabus', 'final', 'new', 'detailed']);
const syllabusKey = (s: string) =>
  normalizeName(s.replace(/&/g, ' and ').split(/[^A-Za-z0-9]+/).filter((w) => w && !SYLLABUS_NOISE.has(w.toLowerCase())).join(''));


const subjectGroups = groupByFolder(SUBJECTS_ROOT);
const subjectFolderByName = new Map([...subjectGroups.keys()].filter(Boolean).map((f) => [normalizeName(f), f]));

/** A subject's own syllabus: the file in its `_Syllabus` folder named after it, or the first one there. */
function ownSyllabus(subject: Subject): NoteFile | undefined {
  const files = subject.files.filter((f) => isSyllabusFolder(f.folder));
  const name = syllabusKey(subject.name);
  const keyed = files.map((f) => ({ f, base: syllabusKey(f.name.replace(/\.[^.]+$/, '')) }));
  return (keyed.find((x) => x.base === name) ?? keyed.find((x) => x.base && (x.base.startsWith(name) || name.startsWith(x.base))))?.f ?? files[0];
}

/**
 * The subjects of a semester (or of the electives) from the curriculum, each with its folder in Subjects/.
 * `scope` (`Semester_3`, `Electives`) was the folder they were in before; it keeps subject ids and file
 * ids as they were, so saved votes, highlights and reading positions still find their file.
 */
function courseSubjects(scope: string, courses: CourseInfo[], withSyllabus: boolean): Subject[] {
  const subjects: Subject[] = courses.map((c) => {
    const folder = subjectFolderByName.get(normalizeName(subjectFolder(c)));
    const legacyRoot = folder ? `${scope}/${legacyFolder(folder)}` : '';
    const files = folder ? (subjectGroups.get(folder) ?? []).map((f) => ({ ...f, id: `${legacyRoot}/${f.path.slice(SUBJECTS_ROOT.length + folder.length + 2)}` })) : [];
    return {
      id: `${slug(scope)}--${slug(c.code + '-' + c.name)}`,
      slug: slug(c.name),
      kind: 'course' as const,
      code: c.code,
      name: c.name,
      description: descriptionFor(c.name),
      units: unitsFor(c.name),
      electiveSlot: /^ELEC\b/.test(c.code),
      credits: c.credits,
      icon: c.icon,
      folder: folder ? `${SUBJECTS_ROOT}/${folder}` : null,
      files,
    };
  });

  // The semester's syllabus page lists each subject's own syllabus (the PDFs stay in the subject folders).
  const syllabi = withSyllabus ? subjects.map(ownSyllabus).filter((f): f is NoteFile => !!f) : [];
  if (syllabi.length) {
    subjects.push({ id: `${slug(scope)}--syllabus`, slug: 'syllabus', kind: 'syllabus', code: 'SYLLABUS', name: 'Syllabus', credits: null, icon: '§', folder: null, files: syllabi });
  }

  // Two subjects can't share a URL within one semester: add the course code if they would.
  const seen = new Set<string>();
  for (const subject of subjects) {
    if (seen.has(subject.slug)) subject.slug = `${subject.slug}-${slug(subject.code)}`;
    seen.add(subject.slug);
  }
  return subjects;
}

/** Collections that are only folders, without a curriculum (Engineering Entrance Preparation). */
function buildSubjects(root: string, courses: CourseInfo[], looseFilesName: string): Subject[] {
  const groups = groupByFolder(root);
  const folderByName = new Map([...groups.keys()].filter(Boolean).map((f) => [normalizeName(f), f]));
  const matched = new Set<string>();

  const subjects: Subject[] = courses.map((c) => {
    // A course's notes live in the folder named in the curriculum, or in a folder named
    // after the course itself — so renaming a folder to the course name keeps working.
    const folder = [c.folder, c.name]
      .filter((n): n is string => !!n)
      .map((n) => folderByName.get(normalizeName(n)))
      .find((f): f is string => !!f && !matched.has(f));
    if (folder) matched.add(folder);
    return {
      id: `${slug(root)}--${slug(c.code + '-' + c.name)}`,
      slug: slug(c.name),
      kind: 'course' as const,
      code: c.code,
      name: c.name,
      description: descriptionFor(c.name),
      units: unitsFor(c.name),
      electiveSlot: /^ELEC\b/.test(c.code),
      credits: c.credits,
      icon: c.icon,
      folder: folder ? `${root}/${folder}` : null,
      files: (folder && groups.get(folder)) || [],
    };
  });

  // Folders not matched to a course (Question Collection, _Syllabus, ...) still get shown.
  for (const [folder, files] of groups) {
    if (!folder || matched.has(folder)) continue;
    const name = folder.replace(/^_+/, '').replace(/_+/g, ' ');
    const isSyllabus = normalizeName(name) === 'syllabus';
    subjects.push({
      id: `${slug(root)}--${slug(folder)}`,
      slug: slug(name),
      kind: isSyllabus ? 'syllabus' : 'resource',
      code: isSyllabus ? 'SYLLABUS' : 'RESOURCES',
      name,
      credits: null,
      icon: resourceIcons.find(([re]) => re.test(name))?.[1] ?? '▤',
      folder: `${root}/${folder}`,
      files,
    });
  }

  // Two subjects can't share a URL within one semester: add the course code if they would.
  const seen = new Set<string>();
  for (const subject of subjects) {
    if (seen.has(subject.slug)) subject.slug = `${subject.slug}-${slug(subject.code)}`;
    seen.add(subject.slug);
  }

  // Files placed directly inside the semester/collection folder.
  const loose = groups.get('');
  if (loose) {
    subjects.push({ id: `${slug(root)}--files`, slug: slug(looseFilesName), kind: 'resource', code: 'RESOURCES', name: looseFilesName, credits: null, icon: '▤', folder: root, files: loose });
  }
  return subjects;
}

export const semesters: Semester[] = [
  ...curriculum.map((s) => ({
    id: String(s.id),
    slug: `semester-${s.id}`,
    badge: String(s.id).padStart(2, '0'),
    year: s.year,
    label: s.label,
    subjects: courseSubjects(`Semester_${s.id}`, s.courses, true),
  })),
  { id: 'electives', slug: 'electives', badge: 'EL', year: 'Year III–IV', label: 'Electives', subjects: courseSubjects('Electives', electiveCourses, false) },
  { id: 'entrance', slug: 'entrance-preparation', badge: 'IOE', year: 'Before Year I', label: 'Entrance Preparation', subjects: buildSubjects('Engineering Entrance Preparation', [], 'Entrance question sets') },
  // Extra collections only show up once their folder has files.
].filter((s) => /^\d+$/.test(s.id) || s.subjects.some((subject) => subject.files.length > 0));

/* ----------------------- Past Question Collection ----------------------- */

/**
 * Past exam papers, kept apart from the notes: `Past Question Collection/<Subject>/`, plus each semester's
 * college assessments in `Past Question Collection/College Assessments/Semester_N/`.
 */
export { PAST_QUESTIONS_FOLDER };

export interface PastQuestionCollection {
  semester: Semester;
  /** Repo folder holding the papers. */
  folder: string;
  /** Papers, with `folder` starting at the subject's folder (e.g. `Applied Physics`, `College Assessments/2024_College_Assessments`). */
  files: NoteFile[];
}

/** One collection per semester, even before any paper is added, so students can see what's missing and send it. */
/** Semesters without written exams (Semester VIII: internship, project and an elective) have no collection. */
const NO_PAST_QUESTIONS = new Set(['8']);

export const pastQuestionCollections: PastQuestionCollection[] = semesters
  .filter((s) => /^\d+$/.test(s.id) && !NO_PAST_QUESTIONS.has(s.id))
  .map((semester) => {
    // The semester's subjects (before-2025 order) and its assessments. Ids keep the path papers had
    // before the move (`Past Question Collection/Semester_N/...`), so saved votes still match.
    const own = new Set((curriculum.find((c) => String(c.id) === semester.id)?.courses ?? []).map((c) => normalizeName(subjectFolder(c))));
    const assessments = `${PAST_QUESTIONS_FOLDER}/${ASSESSMENTS_FOLDER}/Semester_${semester.id}`;
    const legacy = `${PAST_QUESTIONS_FOLDER}/Semester_${semester.id}`;
    const files: NoteFile[] = [];
    for (const e of entries) {
      if (e.path.startsWith(assessments + '/')) {
        const f = toNoteFile(e, assessments);
        const folder = f.folder ? `${ASSESSMENTS_FOLDER}/${f.folder}` : ASSESSMENTS_FOLDER;
        files.push({ ...f, folder, id: `${legacy}/${folder}/${f.name}` });
      } else if (e.path.startsWith(PAST_QUESTIONS_FOLDER + '/')) {
        const f = toNoteFile(e, PAST_QUESTIONS_FOLDER);
        if (f.folder && own.has(normalizeName(f.folder.split('/')[0]))) files.push({ ...f, id: `${legacy}/${f.folder}/${f.name}` });
      }
    }
    return { semester, folder: PAST_QUESTIONS_FOLDER, files };
  });

export const pastQuestionsFor = (semester: Semester) => pastQuestionCollections.find((c) => c.semester === semester);

/** Everything except the syllabus counts as a subject in totals and lists. */
export const isSyllabus = (s: Subject) => s.kind === 'syllabus';

/**
 * The file in the semester's syllabus folder that belongs to `subject`, matched loosely by name
 * ("Communication Techniques.pdf" ↔ Communication Technique) or by course code ("CMP 124").
 */
export function syllabusFileFor(syllabus: Subject | undefined, subject: Subject): NoteFile | undefined {
  if (!syllabus) return undefined;
  const name = syllabusKey(subject.name);
  const code = normalizeName(subject.code);
  const files = syllabus.files.map((f) => ({ f, base: syllabusKey(f.name.replace(/\.[^.]+$/, '')) })).filter((x) => x.base);
  // Exact name first, so "Calculus I" never picks "Calculus II.pdf" when both exist.
  return (
    files.find((x) => x.base === name) ??
    files.find((x) => x.base.startsWith(name) || name.startsWith(x.base) || (code.length > 3 && x.base.includes(code)))
  )?.f;
}

/**
 * Where a subject's syllabus lives: its file in the semester `_Syllabus` folder if there is one,
 * otherwise the first file in the subject's own `_Syllabus` folder.
 */
export function findSyllabus(semesterSyllabus: Subject | undefined, subject: Subject): { subject: Subject; file: NoteFile } | undefined {
  const fromSemester = syllabusFileFor(semesterSyllabus, subject);
  if (fromSemester && semesterSyllabus) return { subject: semesterSyllabus, file: fromSemester };
  const own = subject.files.find((f) => isSyllabusFolder(f.folder));
  return own ? { subject, file: own } : undefined;
}


/** One subject's folder in a semester's Past Question Collection, with an example file name. */
export interface PastQuestionFolder {
  name: string;
  folder: string;
  /** Short form for file names, or null for an elective slot (the elective's own short form is used). */
  short: string | null;
  example: string;
  papers: number;
}

/**
 * The subject folders of a semester's Past Question Collection (exam subjects only: no project or
 * internship) and how many papers each has. File names follow `Year_Spring/Fall_ShortForm`.
 */
export function pastQuestionFolders(semester: Semester): PastQuestionFolder[] {
  const courses = curriculum.find((c) => String(c.id) === semester.id)?.courses ?? [];
  const collection = pastQuestionsFor(semester);
  const term = Number(semester.id) % 2 ? 'Fall' : 'Spring';
  return courses
    .filter((c) => !/^(PRJ|INT)\b/.test(c.code))
    .map((c) => {
      const folder = c.name.replace(/&/g, 'and');
      const short = /^ELEC\b/.test(c.code) ? null : PAST_PAPER_SHORT[folder] ?? null;
      const key = normalizeName(folder);
      return {
        name: c.name,
        folder,
        short,
        example: `2025_${term}_${short ?? '<Elective_Short>'}.pdf`,
        papers: collection?.files.filter((f) => f.folder && normalizeName(f.folder.split('/')[0]) === key).length ?? 0,
      };
    });
}

/* ----------------------------- URLs ----------------------------- */

export const semesterPath = (semester: Semester) => `/${semester.slug}`;

/** A file's path relative to its subject folder — used in `?file=` so links stay short. */
export const fileKey = (subject: Subject, file: NoteFile) => {
  if (subject.folder && file.path.startsWith(subject.folder + '/')) return file.path.slice(subject.folder.length + 1);
  // A semester's syllabus list gathers files from several subject folders: the file name is enough.
  return subject.files.filter((f) => f.name === file.name).length === 1 ? file.name : file.path;
};

/** A paper's key in `?file=`: its path from the subject's folder (`Applied Physics/2024_Fall_AP.pdf`). */
export const pastKey = (file: NoteFile) => (file.folder ? `${file.folder}/${file.name}` : file.name);

export const subjectPath = (semester: Semester, subject: Subject, file?: NoteFile) =>
  `/${semester.slug}/${subject.slug}${file ? `?file=${encodeURIComponent(fileKey(subject, file))}` : ''}`;

/** One subject's papers: /past-questions/semester-3/database-management-system. */
export const pastSubjectPath = (semester: Semester, name: string) => `/past-questions/${semester.slug}/${slug(name)}`;
export const findPastSubject = (semester: Semester, subjectSlug: string) => pastQuestionFolders(semester).find((f) => slug(f.name) === subjectSlug);

/** /past-questions, or one semester's papers at /past-questions/semester-N (?file= opens a paper). */
export const pastQuestionsPath = (semester?: Semester, file?: NoteFile) => {
  if (!semester) return '/past-questions';
  const key = file ? pastKey(file) : '';
  return `/past-questions/${semester.slug}${key ? `?file=${encodeURIComponent(key)}` : ''}`;
};

export function findSemester(slugPart: string) {
  return semesters.find((s) => s.slug === slugPart.toLowerCase());
}

export function findSubject(semester: Semester, slugPart: string) {
  return semester.subjects.find((s) => s.slug === slugPart.toLowerCase());
}

/** Every note file once (a semester's syllabus list only repeats files from its subjects). */
export const allFiles = semesters.flatMap((semester) => semester.subjects.filter((item) => item.kind !== 'syllabus').flatMap((item) => item.files));

// A folder in Subjects/ that no curriculum entry names would never be shown: say so in the build log.
if (typeof window === 'undefined') {
  const shown = new Set(semesters.flatMap((s) => s.subjects).map((s) => s.folder));
  const hidden = [...subjectGroups.keys()].filter((f) => f && !shown.has(`${SUBJECTS_ROOT}/${f}`));
  if (hidden.length) console.warn(`[notes] Folders in ${SUBJECTS_ROOT}/ not in the curriculum (not shown on the site): ${hidden.join(', ')}`);
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
