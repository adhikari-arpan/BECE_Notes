import { ArrowLeft, ArrowRight, ChevronRight, ScrollText } from 'lucide-react';
import { isSyllabus, plural, type Semester } from '@/content/notes';

interface SemesterViewProps {
  semester: Semester;
  onSelectSubject: (subjectId: string) => void;
  onBack: () => void;
}

export function SemesterView({ semester, onSelectSubject, onBack }: SemesterViewProps) {
  // The `_Syllabus` folder gets its own card above the subjects instead of a slot in the grid.
  const syllabus = semester.subjects.find(isSyllabus);
  const subjects = semester.subjects.filter((s) => !isSyllabus(s));

  return (
    <>
      <section className="semester-page-header section-wrap">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to home
        </button>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">{semester.year}</span>
            <h2>{semester.label}</h2>
          </div>
          <span className="subject-count-pill">{plural(subjects.length, 'subject')}</span>
        </div>
      </section>

      <section className="subject-grid-section section-wrap">
        {syllabus && (
          <button className="syllabus-card" onClick={() => onSelectSubject(syllabus.id)}>
            <span className="syllabus-card-icon"><ScrollText size={22} /></span>
            <span className="syllabus-card-body">
              <small>Start here</small>
              <strong>{semester.label} syllabus</strong>
              <span>Official Pokhara University course outline · {plural(syllabus.files.length, 'file')}</span>
            </span>
            <span className="syllabus-card-cta">View syllabus <ArrowRight size={15} /></span>
          </button>
        )}

        <div className="subject-cards-grid">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`subject-card ${subject.files.length === 0 ? 'subject-card-empty' : ''}`}
              onClick={() => onSelectSubject(subject.id)}
            >
              <span className="subject-card-icon">{subject.icon}</span>
              <div className="subject-card-body">
                <small>{subject.code}</small>
                <strong>{subject.name}</strong>
                <span className="subject-card-meta">
                  {subject.credits !== null && `${plural(subject.credits, 'credit')} · `}
                  {subject.files.length > 0 ? plural(subject.files.length, 'file') : 'No notes yet'}
                </span>
              </div>
              <ChevronRight size={16} className="subject-card-arrow" />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
