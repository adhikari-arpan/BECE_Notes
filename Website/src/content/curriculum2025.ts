import { normalizeName, semesters, type Semester, type Subject } from '@/content/notes';

/**
 * The 2025 BE Computer curriculum (Pokhara University Academic Council, 119th meeting, approved
 * 14 May 2025). Same subjects and credits as the earlier structure, taught in a different order.
 * The notes stay organised by the earlier order, so each course here points to the subject page
 * that already has its notes.
 */

interface Course2025 {
  code: string;
  name: string;
  credits: number;
  /** Weekly hours: lecture, tutorial, practical. */
  hours: [number, number, number];
  /** The subject's name in the earlier structure, when it's written differently. */
  from?: string;
}

const course = (code: string, name: string, credits: number, hours: [number, number, number], from?: string): Course2025 => ({ code, name, credits, hours, from });

const CURRICULUM_2025: { id: number; year: string; label: string; courses: Course2025[] }[] = [
  { id: 1, year: 'Year I', label: 'Semester I', courses: [
    course('ELE 120', 'Basic Electrical Engineering', 3, [3, 1, 2]),
    course('MTH 110', 'Calculus I', 3, [3, 2, 0]),
    course('ENG 110', 'Communication Techniques', 2, [2, 2, 0], 'Communication Technique'),
    course('PHY 110', 'Applied Physics', 3, [3, 1, 2]),
    course('CMP 122', 'Computer Workshop', 1, [0, 0, 3]),
    course('CMP 124', 'Programming in C', 3, [3, 1, 3]),
  ] },
  { id: 2, year: 'Year I', label: 'Semester II', courses: [
    course('MTH 150', 'Algebra and Geometry', 3, [3, 2, 0]),
    course('CHM 110', 'Applied Chemistry', 2, [2, 1, 2]),
    course('MEC 116', 'Basic Engineering Drawing', 1, [0, 0, 3]),
    course('ELX 120', 'Electronic Devices and Circuits', 3, [3, 1, 2], 'Electronic Devices & Circuits'),
    course('CMP 160', 'Data Structure and Algorithms', 3, [3, 1, 3], 'Data Structure & Algorithm'),
    course('CMP 162', 'Object Oriented Programming in C++', 3, [3, 1, 3]),
  ] },
  { id: 3, year: 'Year II', label: 'Semester III', courses: [
    course('MTH 210', 'Calculus II', 3, [3, 2, 0]),
    course('CMP 234', 'Computer Graphics', 3, [3, 1, 2]),
    course('ELX 110', 'Digital Logic', 3, [3, 1, 2]),
    course('CMP 222', 'Database Management System', 3, [3, 1, 3]),
    course('CMP 228', 'Advanced Programming with Java', 3, [3, 1, 3]),
    course('CMP 232', 'Operating Systems', 3, [3, 1, 2]),
  ] },
  { id: 4, year: 'Year II', label: 'Semester IV', courses: [
    course('MTH 250', 'Applied Mathematics', 3, [3, 2, 0]),
    course('CMP 224', 'Microprocessor and ALP', 3, [3, 1, 2], 'Microprocessor & Assembly Language Programming'),
    course('ELE 172', 'Instrumentation', 3, [3, 1, 2]),
    course('CMP 348', 'Software Engineering', 3, [3, 1, 2]),
    course('CMM 220', 'Data Communication', 3, [3, 1, 2]),
    course('CMP 264', 'Theory of Computation', 3, [3, 1, 0]),
  ] },
  { id: 5, year: 'Year III', label: 'Semester V', courses: [
    course('CMP 346', 'Artificial Intelligence', 3, [3, 1, 3]),
    course('CMP 344', 'Computer Networks', 3, [3, 1, 2]),
    course('CMP 262', 'Computer Architecture', 3, [3, 1, 1]),
    course('MTH 252', 'Numerical Methods', 2, [2, 1, 2]),
    course('MGT 320', 'Engineering Management', 2, [2, 1, 0]),
    course('CMP 338', 'Simulation and Modeling', 3, [3, 1, 2]),
    course('MTH 216', 'Probability and Statistics', 2, [2, 2, 0]),
  ] },
  { id: 6, year: 'Year III', label: 'Semester VI', courses: [
    course('CMP 270', 'Research Fundamentals', 2, [2, 0, 2]),
    course('CMP 360', 'Compiler Design', 2, [2, 2, 2]),
    course('CMM 344', 'Digital Signal Analysis and Processing', 3, [3, 1, 2]),
    course('CMP 426', 'Network and Cyber Security', 3, [3, 1, 2]),
    course('ELX 320', 'Embedded System', 2, [2, 1, 2]),
    course('CMP 364', 'Machine Learning', 3, [3, 1, 2]),
    course('ELEC I', 'Elective I', 3, [3, 1, 2]),
  ] },
  { id: 7, year: 'Year IV', label: 'Semester VII', courses: [
    course('CMP 424', 'Cloud Computing and Virtualization', 3, [3, 1, 2]),
    course('CMP 422', 'Data Science and Analytics', 2, [2, 1, 2]),
    course('MGT 250', 'Engineering Economics', 3, [3, 1, 0]),
    course('CMP 362', 'Image Processing and Pattern Recognition', 3, [3, 1, 2]),
    course('MGT 332', 'Entrepreneurship and Professional Practice', 2, [2, 1, 0]),
    course('ELEC II', 'Elective II', 3, [3, 1, 2]),
    course('PRJ 360', 'Project I', 2, [0, 0, 2]),
  ] },
  { id: 8, year: 'Year IV', label: 'Semester VIII', courses: [
    course('INT 492', 'Internship', 3, [0, 0, 6]),
    course('PRJ 452', 'Project II', 3, [0, 0, 6]),
    course('ELEC III', 'Elective III', 3, [3, 1, 2]),
  ] },
];

export interface Course2025Entry {
  code: string;
  name: string;
  credits: number;
  hours: [number, number, number];
  /** Where this course's notes are (the subject in the earlier structure), if it exists. */
  subject?: Subject;
  noteSemester?: Semester;
}

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id));

function locate(name: string) {
  const key = normalizeName(name);
  for (const semester of courseSemesters) {
    const subject = semester.subjects.find((s) => s.kind === 'course' && normalizeName(s.name) === key);
    if (subject) return { subject, noteSemester: semester };
  }
  return {};
}

export const semesters2025 = CURRICULUM_2025.map((s) => ({
  ...s,
  courses: s.courses.map((c): Course2025Entry => ({ code: c.code, name: c.name, credits: c.credits, hours: c.hours, ...locate(c.from ?? c.name) })),
}));

/**
 * Every semester's courses in the chosen order, in the same shape: the 2025-onwards order above, or
 * the before-2025 order (the notes' own semesters and codes). Weekly hours are the same either way,
 * so the before-2025 courses borrow them from their 2025 entry.
 */
export function syllabusSemesters(structure: 'pre2025' | '2025'): Semester2025[] {
  if (structure === '2025') return semesters2025;
  const all = semesters2025.flatMap((s) => s.courses);
  return courseSemesters.map((sem) => ({
    id: Number(sem.id),
    year: sem.year,
    label: sem.label,
    courses: sem.subjects.filter((s) => s.kind === 'course').map((s): Course2025Entry => ({
      code: s.code,
      name: s.name,
      credits: s.credits ?? 0,
      hours: all.find((c) => c.subject === s)?.hours ?? [0, 0, 0],
      subject: s,
      noteSemester: sem,
    })),
  }));
}

export type Semester2025 = (typeof semesters2025)[number];

/** /syllabus (all semesters) or /syllabus/semester-N. */
export const syllabusPath = (id?: number) => (id ? `/syllabus/semester-${id}` : '/syllabus');

/** The 2025-structure semester a subject belongs to (by its notes page). */
export function semester2025For(subject: Subject) {
  return semesters2025.find((s) => s.courses.some((c) => c.subject === subject));
}

/** Codes, names and credits only — the same shape as `curriculumSemesters`, for the CGPA calculator. */
export const curriculumSemesters2025 = CURRICULUM_2025.map((s) => ({
  id: s.id,
  label: s.label,
  year: s.year,
  courses: s.courses.map(({ code, name, credits }) => ({ code, name, credits })),
}));
