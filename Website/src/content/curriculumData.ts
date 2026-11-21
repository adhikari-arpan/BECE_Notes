/**
 * Where everything is in the repository, and the before-2025 curriculum it's arranged by.
 * Plain data with no imports, so the build plugins (plugins/notes.ts) can read it too.
 *
 * Layout:
 *   Subjects/<Subject>/…                                   notes: one folder per subject, whichever semester teaches it
 *   Past Question Collection/<Subject>/<Year>_<Term>_<Short>.pdf
 *   Past Question Collection/College Assessments/Semester_N/<Year>_College_Assessments/…
 *
 * A subject's folder is its name below with "&" written as "and" (or `folder` when that can't be used).
 */

export const SUBJECTS_ROOT = 'Subjects';
export const PAST_QUESTIONS_FOLDER = 'Past Question Collection';
/** Inside the Past Question Collection: assessments cover a whole semester, so they're kept by semester. */
export const ASSESSMENTS_FOLDER = 'College Assessments';

export interface CourseInfo {
  code: string;
  name: string;
  credits: number | null;
  icon: string;
  /** The subject's folder in Subjects/, when it isn't simply the name. */
  folder?: string;
}

export const course = (code: string, name: string, credits: number | null, icon: string, folder?: string): CourseInfo => ({ code, name, credits, icon, folder });

/** A course's folder name in Subjects/ (and in the Past Question Collection). */
export const subjectFolder = (c: CourseInfo) => c.folder ?? c.name.replace(/&/g, 'and');

/** Pokhara University BECE curriculum, before-2025 order (the 2025 order is in curriculum2025.ts). */
export const curriculum: { id: number; year: string; label: string; courses: CourseInfo[] }[] = [
  { id: 1, year: 'Year I', label: 'Semester I', courses: [course('MTH 110', 'Calculus I', 3, '∫'), course('ELX 110', 'Digital Logic', 3, '01'), course('CMP 124', 'Programming in C', 3, '</>'), course('ELE 110', 'Basic Electrical Engineering', 3, '∿'), course('CMP 122', 'Computer Workshop', 1, '⌘'), course('ENG 110', 'Communication Technique', 2, 'Aa'), course('ELX 111', 'Electronic Devices & Circuits', 3, '◈')] },
  { id: 2, year: 'Year I', label: 'Semester II', courses: [course('MTH 150', 'Algebra & Geometry', 3, '△'), course('PHY 110', 'Applied Physics', 3, '◉'), course('CHM 110', 'Applied Chemistry', 2, '⚗'), course('MEC 116', 'Basic Engineering Drawing', 1, '✎'), course('CMP 162', 'Object Oriented Programming in C++', 3, '{}'), course('CMP 165', 'Data Structure & Algorithm', 3, '[]'), course('ELE 172', 'Instrumentation', 3, '◌')] },
  { id: 3, year: 'Year II', label: 'Semester III', courses: [course('MTH 210', 'Calculus II', 3, '∫'), course('CMP 222', 'Database Management System', 3, 'DB'), course('CMP 232', 'Operating Systems', 3, 'OS'), course('CMP 224', 'Microprocessor & Assembly Language Programming', 3, 'µP'), course('CMP 234', 'Computer Graphics', 3, '✦'), course('CMP 220', 'Data Communication', 3, '↔')] },
  { id: 4, year: 'Year II', label: 'Semester IV', courses: [course('MTH 250', 'Applied Mathematics', 3, 'Σ'), course('MTH 257', 'Numerical Methods', 2, '≈'), course('CMP 228', 'Advanced Programming with Java', 3, 'J'), course('CMP 254', 'Theory of Computation', 3, 'λ'), course('CMP 262', 'Computer Architecture', 3, '▦'), course('CMP 270', 'Research Fundamentals', 2, '⌁')] },
  { id: 5, year: 'Year III', label: 'Semester V', courses: [course('MTH 216', 'Probability & Statistics', 2, 'σ'), course('ELX 320', 'Embedded System', 2, '▣'), course('MGT 320', 'Engineering Management', 2, '↗'), course('CMP 346', 'Artificial Intelligence', 3, 'AI'), course('CMM 344', 'Digital Signal Analysis & Processing', 3, 'DSP'), course('CMP 340', 'Software Engineering', 3, 'SE')] },
  { id: 6, year: 'Year III', label: 'Semester VI', courses: [course('CMP 362', 'Image Processing & Pattern Recognition', 3, '▧'), course('CMP 364', 'Machine Learning', 3, 'ML'), course('CMP 344', 'Computer Networks', 3, '↯'), course('CMP 338', 'Simulation & Modeling', 3, '◌'), course('CMP 422', 'Compiler Design', 2, '⌘'), course('ELEC I', 'Elective I', 3, '＋'), course('PRJ 360', 'Project I', 2, '↗')] },
  { id: 7, year: 'Year IV', label: 'Semester VII', courses: [course('MGT 332', 'Entrepreneurship & Professional Practice', 2, '↗'), course('MGT 290', 'Engineering Economics', 3, '₨'), course('CMP 426', 'Network & Cyber Security', 3, '⌁'), course('CMP 424', 'Cloud Computing & Virtualization', 3, '☁'), course('CMP 360', 'Data Science & Analytics', 2, 'DS'), course('ELEC II', 'Elective II', 3, '＋')] },
  { id: 8, year: 'Year IV', label: 'Semester VIII', courses: [course('ELEC III', 'Elective III', 3, '＋'), course('INT 492', 'Internship', 3, '▤'), course('PRJ 452', 'Project II', 3, '↗')] },
];

export const electiveCourses: CourseInfo[] = [
  course('CMP 438', 'Big Data Technologies', 3, 'BD'),
  course('CMP 459', 'Natural Language Processing', 3, 'NLP'),
  course('ELECTIVE', 'Cybersecurity', 3, '⌁'),
  // A folder can't start with "." (it would be hidden), so ".NET" is spelled out.
  course('ELECTIVE', '.NET Technologies', 3, '#', 'Dot Net Technologies'),
  course('ELECTIVE', 'Generative AI', 3, 'AI'),
  course('ELECTIVE', 'Information System Audit', 3, '✓'),
  course('ELECTIVE', 'Mobile App Development', 3, '▯'),
];

/**
 * Folder names from before the move to Subjects/ (November 2026), where they differed. Each file keeps
 * the path it had then as its id, so votes, highlights and reading positions saved under it carry over.
 */
const LEGACY_FOLDERS: Record<string, string> = {
  'Calculus I': 'Calculus-I',
  'Electronic Devices and Circuits': 'Electronic Devices & Circuit',
  'Algebra and Geometry': 'Algebra & Geometry',
  'Data Structure and Algorithm': 'Data Structure & Algorithm',
  'Microprocessor and Assembly Language Programming': 'Microprocessor',
  'Operating Systems': 'Operating System',
  'Image Processing and Pattern Recognition': 'Image Processing & Pattern Recognition',
  'Big Data Technologies': 'Big Data',
  'Dot Net Technologies': 'Dot Net',
};
export const legacyFolder = (folder: string) => LEGACY_FOLDERS[folder] ?? folder;
