import { config, entries, type ManifestEntry } from 'virtual:notes-manifest';
import { subjectDescriptions } from '@/content/descriptions';

export type FileKind = 'pdf' | 'doc' | 'slides' | 'sheet' | 'image' | 'markdown' | 'code' | 'text' | 'other';

export interface NoteFile {
  id: string;
  name: string;
  /** Repo-relative path, e.g. `Semester_3/DBMS/NCIT Notes/Unit 1.pdf`. */
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

interface CourseInfo {
  code: string;
  name: string;
  credits: number | null;
  icon: string;
  /** Folder name used for this subject inside the semester folder. */
  folder?: string;
}

const course = (code: string, name: string, credits: number | null, icon: string, folder?: string): CourseInfo => ({ code, name, credits, icon, folder });

/** Pokhara University BECE curriculum. `folder` maps a course to its folder name in this repo. */
const curriculum: { id: number; year: string; label: string; courses: CourseInfo[] }[] = [
  { id: 1, year: 'Year I', label: 'Semester I', courses: [course('MTH 110', 'Calculus I', 3, '∫', 'Calculus-I'), course('ELX 110', 'Digital Logic', 3, '01', 'Digital Logic'), course('CMP 124', 'Programming in C', 3, '</>', 'Programming in C'), course('ELE 110', 'Basic Electrical Engineering', 3, '∿', 'Basic Electrical Engineering'), course('CMP 122', 'Computer Workshop', 1, '⌘'), course('ENG 110', 'Communication Technique', 2, 'Aa', 'Communication Technique'), course('ELX 111', 'Electronic Devices & Circuits', 3, '◈', 'Electronic Devices & Circuit')] },
  { id: 2, year: 'Year I', label: 'Semester II', courses: [course('MTH 150', 'Algebra & Geometry', 3, '△'), course('PHY 110', 'Applied Physics', 3, '◉', 'Applied Physics'), course('CHM 110', 'Applied Chemistry', 2, '⚗', 'Applied Chemistry'), course('MEC 116', 'Basic Engineering Drawing', 1, '✎', 'Engineering Drawing'), course('CMP 162', 'Object Oriented Programming in C++', 3, '{}', 'OOP in C++'), course('CMP 165', 'Data Structure & Algorithm', 3, '[]', 'DSA'), course('ELE 172', 'Instrumentation', 2, '◌', 'Instrumentation')] },
  { id: 3, year: 'Year II', label: 'Semester III', courses: [course('MTH 210', 'Calculus II', 3, '∫'), course('CMP 222', 'Database Management System', 3, 'DB', 'DBMS'), course('CMP 232', 'Operating Systems', 3, 'OS', 'Operating System'), course('CMP 224', 'Microprocessor & Assembly Language Programming', 3, 'µP', 'Microprocessor'), course('CMP 234', 'Computer Graphics', 3, '✦', 'Computer Graphics'), course('CMP 220', 'Data Communication', 3, '↔', 'Data Communication')] },
  { id: 4, year: 'Year II', label: 'Semester IV', courses: [course('MTH 250', 'Applied Mathematics', 3, 'Σ', 'Applied Mathematics'), course('MTH 257', 'Numerical Methods', 2, '≈', 'Numerical Methods'), course('CMP 228', 'Advanced Programming with Java', 3, 'J', 'Java'), course('CMP 254', 'Theory of Computation', 3, 'λ', 'Theory of Computation'), course('CMP 262', 'Computer Architecture', 3, '▦', 'Computer Architecture'), course('CMP 270', 'Research Fundamentals', 2, '⌁', 'Research Fundamentals')] },
  { id: 5, year: 'Year III', label: 'Semester V', courses: [course('MTH 216', 'Probability & Statistics', 2, 'σ', 'Probability and Statistics'), course('ELX 320', 'Embedded System', 2, '▣', 'Embedded System'), course('MGT 320', 'Engineering Management', 2, '↗', 'Engineering Management'), course('CMP 346', 'Artificial Intelligence', 3, 'AI', 'Artificial Intelligence'), course('CMM 344', 'Digital Signal Analysis & Processing', 3, 'DSP', 'DSAP'), course('CMP 340', 'Software Engineering', 3, 'SE', 'Software Engineering')] },
  { id: 6, year: 'Year III', label: 'Semester VI', courses: [course('CMP 362', 'Image Processing & Pattern Recognition', 3, '▧'), course('CMP 364', 'Machine Learning', 2, 'ML'), course('CMP 360', 'Data Science & Analytics', 2, 'DS'), course('CMP 344', 'Computer Networks', 3, '↯'), course('CMP 338', 'Simulation & Modeling', 2, '◌', 'Simulation and Modeling'), course('CMP 422', 'Compiler Design', 3, '⌘', 'Compiler Design'), course('ELEC I', 'Elective I', 3, '＋'), course('PRJ 360', 'Project I', 2, '↗')] },
  { id: 7, year: 'Year IV', label: 'Semester VII', courses: [course('MGT 332', 'Entrepreneurship & Professional Practice', 2, '↗'), course('MGT 290', 'Engineering Economics', 3, '₨'), course('CMP 426', 'Network & Cyber Security', 3, '⌁'), course('CMP 424', 'Cloud Computing & Virtualization', 2, '☁'), course('ELEC II', 'Elective II', 3, '＋')] },
  { id: 8, year: 'Year IV', label: 'Semester VIII', courses: [course('ELEC III', 'Elective III', 3, '＋'), course('INT 492', 'Internship', 3, '▤'), course('PRJ 452', 'Project II', 3, '↗')] },
];

const electiveCourses: CourseInfo[] = [
  course('CMP 438', 'Big Data Technologies', 3, 'BD', 'Big Data'),
  course('CMP 459', 'Natural Language Processing', 3, 'NLP', 'Natural Language Processing'),
  course('ELECTIVE', 'Cybersecurity', 3, '⌁', 'Cybersecurity'),
  course('ELECTIVE', '.NET Development', 3, '#', 'Dot Net'),
  course('ELECTIVE', 'Generative AI', 3, 'AI', 'Generative AI'),
  course('ELECTIVE', 'Information System Audit', 3, '✓', 'Information System Audit'),
  course('ELECTIVE', 'Mobile App Development', 3, '▯', 'Mobile App Development'),
];

/** Folders holding shared material rather than a single subject (Question Collection, _Syllabus, ...). */
const resourceIcons: [RegExp, string][] = [
  [/syllabus/i, '§'],
  [/question|assessment/i, '?'],
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
    subjects: buildSubjects(`Semester_${s.id}`, s.courses, 'General resources'),
  })),
  { id: 'electives', slug: 'electives', badge: 'EL', year: 'Year III–IV', label: 'Electives', subjects: buildSubjects('Electives', electiveCourses, 'General resources') },
  { id: 'entrance', slug: 'entrance-preparation', badge: 'IOE', year: 'Before Year I', label: 'Entrance Preparation', subjects: buildSubjects('Engineering Entrance Preparation', [], 'Entrance question sets') },
  // Extra collections only show up once their folder has files.
].filter((s) => /^\d+$/.test(s.id) || s.subjects.some((subject) => subject.files.length > 0));

/** True for a file inside a subject's own `_Syllabus` (or `Syllabus`) folder. */
export const isSyllabusFolder = (folder: string) => normalizeName(folder.split('/')[0]) === 'syllabus';

/** Everything except the syllabus counts as a subject in totals and lists. */
export const isSyllabus = (s: Subject) => s.kind === 'syllabus';

/** Name key for syllabus matching: ignores filler words and "syllabus"/"final"/"new" in file names. */
const SYLLABUS_NOISE = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'with', 'for', 'to', 'syllabus', 'final', 'new', 'detailed']);
const syllabusKey = (s: string) =>
  normalizeName(s.replace(/&/g, ' and ').split(/[^A-Za-z0-9]+/).filter((w) => w && !SYLLABUS_NOISE.has(w.toLowerCase())).join(''));

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

/* ----------------------------- URLs ----------------------------- */

export const semesterPath = (semester: Semester) => `/${semester.slug}`;

/** A file's path relative to its subject folder — used in `?file=` so links stay short. */
export const fileKey = (subject: Subject, file: NoteFile) =>
  subject.folder && file.path.startsWith(subject.folder + '/') ? file.path.slice(subject.folder.length + 1) : file.path;

export const subjectPath = (semester: Semester, subject: Subject, file?: NoteFile) =>
  `/${semester.slug}/${subject.slug}${file ? `?file=${encodeURIComponent(fileKey(subject, file))}` : ''}`;

export function findSemester(slugPart: string) {
  return semesters.find((s) => s.slug === slugPart.toLowerCase());
}

export function findSubject(semester: Semester, slugPart: string) {
  return semester.subjects.find((s) => s.slug === slugPart.toLowerCase());
}

export const allFiles = semesters.flatMap((semester) => semester.subjects.flatMap((item) => item.files));

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
