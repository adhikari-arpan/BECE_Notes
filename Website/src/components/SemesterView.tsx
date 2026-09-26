import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { findSyllabus, isSyllabus, plural, type Semester } from '@/content/notes';

interface SemesterViewProps {
  semester: Semester;
  onSelectSubject: (subjectId: string, fileId?: string) => void;
  onBack: () => void;
}

export function SemesterView({ semester, onSelectSubject, onBack }: SemesterViewProps) {
  // The `_Syllabus` folder (one detailed syllabus file per subject) is linked from the table, not the grid.
  const syllabus = semester.subjects.find(isSyllabus);
  const subjects = semester.subjects.filter((s) => !isSyllabus(s));
  const courses = subjects.filter((s) => s.kind === 'course');
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  // Show the Syllabus column when there's a semester syllabus folder or any subject has its own.
  const hasSyllabusColumn = !!syllabus || courses.some((c) => findSyllabus(undefined, c));

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
          <span className="subject-count-pill">{plural(courses.length, 'subject')}{totalCredits ? ` · ${totalCredits} credits` : ''}</span>
        </div>
      </section>

      <section className="subject-grid-section section-wrap">
        {courses.length > 0 && (
          <div className="course-table-wrap">
            <table className="course-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject</th>
                  <th className="num">Credits</th>
                  {hasSyllabusColumn && <th>Syllabus</th>}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const syllabusFile = findSyllabus(syllabus, c);
                  return (
                    <tr key={c.id}>
                      <td className="code">{c.code}</td>
                      <td>
                        <button className="course-table-link" onClick={() => onSelectSubject(c.id)}>
                          <span className="course-table-icon">{c.icon}</span>
                          {c.name}
                        </button>
                      </td>
                      <td className="num">{c.credits ?? '—'}</td>
                      {hasSyllabusColumn && (
                        <td>
                          {syllabusFile ? (
                            <button className="syllabus-link" onClick={() => onSelectSubject(syllabusFile.subjectId, syllabusFile.file.id)} title={syllabusFile.file.name}>
                              <FileText size={13} /> View
                            </button>
                          ) : <span className="muted">—</span>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {totalCredits > 0 && (
                <tfoot>
                  <tr>
                    <td />
                    <td>Total</td>
                    <td className="num">{totalCredits}</td>
                    {hasSyllabusColumn && (
                      <td>
                        {syllabus && <button className="syllabus-all-link" onClick={() => onSelectSubject(syllabus.id)}>
                          All syllabus files <ArrowRight size={13} />
                        </button>}
                      </td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}


        <h3 className="notes-heading">Subject notes</h3>
        <div className="subject-cards-grid">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`subject-card ${subject.files.length === 0 ? 'subject-card-empty' : ''} ${subject.kind === 'resource' ? 'subject-card-resource' : ''}`}
              onClick={() => onSelectSubject(subject.id)}
            >
              <span className="subject-card-glyph" aria-hidden="true">{subject.icon}</span>
              <span className="subject-card-top">
                <span className="subject-card-icon">{subject.icon}</span>
                <span className="subject-card-code">{subject.kind === 'resource' ? 'Resources' : subject.code}</span>
              </span>
              <strong className="subject-card-name">{subject.name}</strong>
              <span className="subject-card-foot">
                <span className="subject-card-meta">
                  {subject.credits !== null && <span>{plural(subject.credits, 'credit')}</span>}
                  <span>{subject.files.length > 0 ? plural(subject.files.length, 'file') : 'No notes yet'}</span>
                </span>
                <span className="subject-card-go"><ArrowRight size={15} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
