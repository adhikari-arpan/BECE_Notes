import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { findSyllabus, isSyllabus, plural, subjectPath, type Semester, type Subject } from '@/content/notes';
import { semesters2025 } from '@/content/curriculum2025';
import { useStructure } from '@/content/structure';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';

interface SemesterViewProps {
  semester: Semester;
}

/** One row of the semester's course table, and where that course's notes live. */
interface Row {
  key: string;
  code: string;
  name: string;
  credits: number | null;
  subject?: Subject;
  /** The semester page (earlier structure) holding the notes; differs from this one in the 2025 view. */
  noteSemester: Semester;
}

const syllabusOf = (semester: Semester) => semester.subjects.find(isSyllabus);

export function SemesterView({ semester }: SemesterViewProps) {
  const structure = useStructure();
  const isCourseSemester = /^\d+$/.test(semester.id);
  const in2025 = structure === '2025' && isCourseSemester;
  const syllabus = syllabusOf(semester);
  const subjects = semester.subjects.filter((s) => !isSyllabus(s));

  // The course table: this semester's courses, or — in the 2025 view — the 2025 courses for this
  // semester number, each pointing to the subject page that has its notes.
  const rows: Row[] = in2025
    ? (semesters2025.find((s) => String(s.id) === semester.id)?.courses ?? []).map((c) => ({
        key: c.code + c.name, code: c.code, name: c.name, credits: c.credits, subject: c.subject, noteSemester: c.noteSemester ?? semester,
      }))
    : subjects.filter((s) => s.kind === 'course').map((s) => ({
        key: s.id, code: s.code, name: s.name, credits: s.credits, subject: s, noteSemester: semester,
      }));
  const totalCredits = rows.reduce((sum, r) => sum + (r.credits ?? 0), 0);
  const hasSyllabusColumn = in2025 || !!syllabus || rows.some((r) => r.subject && findSyllabus(undefined, r.subject));

  // Subject cards: the courses' note pages (not elective slots), plus — in the usual view — this
  // semester's own resource folders (question collections...), which follow the earlier order.
  const cards: { subject: Subject; noteSemester: Semester }[] = [
    ...rows.filter((r) => r.subject && !r.subject.electiveSlot).map((r) => ({ subject: r.subject!, noteSemester: r.noteSemester })),
    ...(in2025 ? [] : subjects.filter((s) => s.kind !== 'course').map((s) => ({ subject: s, noteSemester: semester }))),
  ];

  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">{semester.year}</span>
            <h2>{semester.label}</h2>
          </div>
          <span className="subject-count-pill">{plural(rows.length, 'subject')}{totalCredits ? ` · ${totalCredits} credits` : ''}</span>
        </div>
        {isCourseSemester && (
          <div className="structure-bar">
            <StructureToggle />
          </div>
        )}
      </section>

      <section className="subject-grid-section section-wrap">
        {rows.length > 0 && (
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
                {rows.map((r) => {
                  const c = r.subject;
                  const syllabusFile = c && !c.electiveSlot ? findSyllabus(syllabusOf(r.noteSemester), c) : undefined;
                  return (
                    <tr key={r.key}>
                      <td className="code">{r.code}</td>
                      <td>
                        {c?.electiveSlot ? (
                          // Elective notes live in the Electives collection, whichever one the student picked.
                          <Link to="/electives" className="course-table-link elective-slot-link">
                            <span className="course-table-icon">{c.icon}</span>
                            {r.name}
                            <span className="elective-slot-hint" role="tooltip">
                              Find notes for the elective you've chosen in <strong>Electives</strong> <ArrowRight size={12} />
                            </span>
                          </Link>
                        ) : c ? (
                          <Link to={subjectPath(r.noteSemester, c)} className="course-table-link">
                            <span className="course-table-icon">{c.icon}</span>
                            {r.name}
                          </Link>
                        ) : (
                          <span className="course-table-link">{r.name}</span>
                        )}
                      </td>
                      <td className="num">{r.credits ?? '—'}</td>
                      {hasSyllabusColumn && (
                        <td>
                          {syllabusFile ? (
                            <Link to={subjectPath(r.noteSemester, syllabusFile.subject, syllabusFile.file)} className="syllabus-link" title={syllabusFile.file.name}>
                              <FileText size={13} /> View
                            </Link>
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
                        {!in2025 && syllabus && <Link to={subjectPath(semester, syllabus)} className="syllabus-all-link">
                          All syllabus files <ArrowRight size={13} />
                        </Link>}
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
          {cards.map(({ subject, noteSemester }) => (
            <Link
              key={subject.id}
              to={subjectPath(noteSemester, subject)}
              className={`subject-card ${subject.files.length === 0 ? 'subject-card-empty' : ''} ${subject.kind === 'resource' ? 'subject-card-resource' : ''}`}
            >
              <span className="subject-card-glyph" data-glyph={subject.icon} aria-hidden="true" />
              <span className="subject-card-top">
                <span className="subject-card-icon">{subject.icon}</span>
                <span className="subject-card-code">{subject.kind === 'resource' ? 'Resources' : subject.code}</span>
              </span>
              <strong className="subject-card-name">{subject.name}</strong>
              {subject.description && <span className="subject-card-desc">{subject.description}</span>}
              <span className="subject-card-foot">
                <span className="subject-card-meta">
                  {subject.credits !== null && <span>{plural(subject.credits, 'credit')}</span>}
                  <span>{subject.files.length > 0 ? plural(subject.files.length, 'file') : 'No notes yet'}</span>
                </span>
                <span className="subject-card-go"><ArrowRight size={15} /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
