import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/Link';
import { isSyllabus, plural, semesterPath, semesters } from '@/content/notes';
import { semesters2025 } from '@/content/curriculum2025';
import type { Structure } from '@/content/structure';

/** The semester cards (plus electives and extra collections), used on the home page and /notes. */
export function SemesterCards({ structure }: { structure: Structure }) {
  return (
    <div className="semester-cards">
      {semesters.map((semester) => {
        const courses2025 = structure === '2025' ? semesters2025.find((s) => String(s.id) === semester.id)?.courses : undefined;
        // In the 2025 view, a semester's numbers come from its 2025 courses (wherever their notes are filed).
        const subjects = courses2025
          ? courses2025.map((c) => c.subject).filter((s): s is NonNullable<typeof s> => !!s)
          : semester.subjects.filter((s) => !isSyllabus(s));
        const withNotes = subjects.filter((s) => s.files.length > 0).length;
        const files = subjects.reduce((sum, s) => sum + s.files.length, 0);
        const credits = courses2025
          ? courses2025.reduce((sum, c) => sum + c.credits, 0)
          : subjects.reduce((sum, s) => sum + (s.kind === 'course' ? s.credits ?? 0 : 0), 0);
        return (
          <Link
            key={semester.id}
            to={semesterPath(semester)}
            className={`semester-card ${files === 0 ? 'semester-card-empty' : ''}`}
          >
            <span className="semester-card-glyph" data-glyph={semester.badge} aria-hidden="true" />
            <span className="semester-card-top">
              <span className="semester-card-badge">{semester.badge}</span>
              <span className="semester-card-year">{semester.year}</span>
            </span>
            <strong className="semester-card-name">{semester.label}</strong>
            <span className="semester-card-progress">
              {files === 0 ? 'Coming soon' : `${withNotes}/${subjects.length} subjects with notes`}
            </span>
            <span className="semester-card-foot">
              <span className="semester-card-meta">
                {files > 0 && <span>{plural(files, 'file')}</span>}
                {credits > 0 && <span>{credits} credits</span>}
              </span>
              <span className="semester-card-go"><ArrowRight size={15} /></span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
