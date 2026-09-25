import { ArrowLeft, ChevronRight } from 'lucide-react';
import { plural, type Semester } from '@/content/notes';

interface SemesterViewProps {
  semester: Semester;
  onSelectSubject: (subjectId: string) => void;
  onBack: () => void;
}

export function SemesterView({ semester, onSelectSubject, onBack }: SemesterViewProps) {
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
          <span className="subject-count-pill">{semester.subjects.length} subjects</span>
        </div>
      </section>

      <section className="subject-grid-section section-wrap">
        <div className="subject-cards-grid">
          {semester.subjects.map((subject) => (
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
                  {subject.credits !== null && `${subject.credits} credits · `}
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
