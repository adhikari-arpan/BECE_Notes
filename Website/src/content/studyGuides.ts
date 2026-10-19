import { semesters, type Semester, type Subject } from '@/content/notes';

/** One study guide page per subject (the before-2025 semester it's filed under gives its context). */
export interface StudyGuideEntry {
  slug: string;
  subject: Subject & { guide: NonNullable<Subject['guide']> };
  semester: Semester;
}

const seen = new Set<string>();
export const studyGuides: StudyGuideEntry[] = semesters.flatMap((semester) =>
  semester.subjects.flatMap((subject) => {
    if (!subject.guide || subject.electiveSlot || seen.has(subject.slug)) return [];
    seen.add(subject.slug);
    return [{ slug: subject.slug, subject: subject as StudyGuideEntry['subject'], semester }];
  }),
);

export const STUDY_GUIDES_PATH = '/study-guides';
export const studyGuidePath = (entry?: Pick<StudyGuideEntry, 'slug'>) => (entry ? `${STUDY_GUIDES_PATH}/${entry.slug}` : STUDY_GUIDES_PATH);
export const findStudyGuide = (slug: string) => studyGuides.find((g) => g.slug === slug);
export const studyGuideForSubject = (subject: Subject) => studyGuides.find((g) => g.subject.id === subject.id || g.slug === subject.slug);

export const STUDY_GUIDES_TITLE = 'Study Guides — Pokhara University BE Computer Engineering';
export const STUDY_GUIDES_DESCRIPTION =
  'How to study every Pokhara University BE Computer Engineering subject: the topics worth extra time, how to practise, and how to prepare for the final exam.';
export const studyGuideTitle = (g: StudyGuideEntry) => `How to Study ${g.subject.name} — ${g.semester.label}, PU BECE`;
export const studyGuideDescription = (g: StudyGuideEntry) =>
  `Study guide for ${g.subject.name}${g.subject.kind === 'course' ? ` (${g.subject.code})` : ''}, ${g.semester.label}, Pokhara University BE Computer Engineering: key topics, how to study it and exam tips.`;
