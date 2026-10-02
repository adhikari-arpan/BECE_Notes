import { ArrowLeft, ArrowRight, BookOpen, FileText, GraduationCap, Layers } from 'lucide-react';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';
import { CiteThis } from '@/components/CiteThis';
import { findSyllabus, isSyllabus, subjectPath } from '@/content/notes';
import { syllabusPath, syllabusSemesters, type Course2025Entry } from '@/content/curriculum2025';
import { STRUCTURE_LABELS, useStructure } from '@/content/structure';

/** Where to read a course's detailed syllabus PDF, if the repo has one. */
function syllabusLink(c: Course2025Entry) {
  if (!c.subject || !c.noteSemester || c.subject.electiveSlot) return undefined;
  const found = findSyllabus(c.noteSemester.subjects.find(isSyllabus), c.subject);
  return found && subjectPath(c.noteSemester, found.subject, found.file);
}

const codeLabel = (code: string) => (code.startsWith('ELEC') ? '—' : code);

/**
 * The BE Computer Engineering syllabus: an overview of all eight semesters at /syllabus, and one
 * page per semester at /syllabus/semester-N listing every course with its code, credits, weekly
 * hours, a short description and links to the notes and syllabus PDF. Follows the curriculum switch
 * (before 2025 batch / 2025 batch onwards).
 */
export function SyllabusView({ semesterId }: { semesterId?: number }) {
  const structure = useStructure();
  const semesters = syllabusSemesters(structure);
  const semester = semesterId ? semesters.find((s) => s.id === semesterId) : undefined;
  const totalCredits = semesters.reduce((sum, s) => sum + s.courses.reduce((a, c) => a + c.credits, 0), 0);
  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  if (!semester) {
    return (
      <>
        <section className="semester-page-header section-wrap">
          <Link to="/" className="back-button"><ArrowLeft size={16} /> Back to home</Link>
          <div className="semester-page-title">
            <div>
              <span className="section-kicker">Pokhara University · BE Computer Engineering</span>
              <h2>Syllabus &amp; course structure</h2>
            </div>
            <span className="subject-count-pill">8 semesters · {totalCredits} credits</span>
          </div>
          <p className="syllabus-lead">
            Pokhara University’s BE Computer Engineering syllabus: every semester’s courses, course codes, credit hours and
            weekly lecture, tutorial and practical hours, with links to notes and detailed syllabus files.
          </p>
          <div className="structure-bar"><StructureToggle /></div>
        </section>

        <section className="subject-grid-section section-wrap">
          <div className="guide-cards syllabus-facts syllabus-facts-two">
            <div><span>Duration</span><strong>4 years</strong><small>8 semesters, up to 8 years allowed</small></div>
            <div><span>Total credits</span><strong>{totalCredits}</strong><small>{totalCourses} courses, including 3 electives</small></div>
          </div>

          {/* One row per year, with its two semesters side by side. */}
          {[...new Set(semesters.map((s) => s.year))].map((year) => (
          <div key={year} className="syllabus-year">
          <span className="syllabus-year-label">{year}</span>
          <div className="syllabus-grid">
            {semesters.filter((s) => s.year === year).map((s) => (
              <Link key={s.id} to={syllabusPath(s.id)} className="syllabus-card">
                <span className="syllabus-card-top">
                  <span className="semester-card-badge">{String(s.id).padStart(2, '0')}</span>
                  <span className="semester-card-year">{s.year}</span>
                </span>
                <strong>{s.label}</strong>
                <ul>
                  {s.courses.map((c) => <li key={c.code + c.name}><span>{codeLabel(c.code)}</span><span>{c.name}</span></li>)}
                </ul>
                <span className="syllabus-card-foot">
                  <span>{s.courses.length} courses · {s.courses.reduce((a, c) => a + c.credits, 0)} credits</span>
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
          </div>
          ))}
          <CiteThis title="Pokhara University BE Computer Engineering syllabus" path={syllabusPath()} />
        </section>
      </>
    );
  }

  const credits = semester.courses.reduce((a, c) => a + c.credits, 0);
  const prev = semesters.find((s) => s.id === semester.id - 1);
  const next = semesters.find((s) => s.id === semester.id + 1);

  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to={syllabusPath()} className="back-button"><ArrowLeft size={16} /> All semesters</Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Syllabus · {semester.year} · {STRUCTURE_LABELS[structure]}</span>
            <h2>{semester.label} syllabus</h2>
          </div>
          <span className="subject-count-pill">{semester.courses.length} courses · {credits} credits</span>
        </div>
        <p className="syllabus-lead">
          Pokhara University BE Computer Engineering, {semester.label}: course codes, credit hours and weekly lecture (L),
          tutorial (T) and practical (P) hours, with a summary of what each course covers.
        </p>
        <div className="structure-bar"><StructureToggle /></div>
      </section>

      <section className="subject-grid-section section-wrap">
        <div className="course-table-wrap">
          <table className="course-table syllabus-table">
            <thead>
              <tr><th>Code</th><th>Course</th><th className="num">Credits</th><th className="num">L</th><th className="num">T</th><th className="num">P</th></tr>
            </thead>
            <tbody>
              {semester.courses.map((c) => (
                <tr key={c.code + c.name}>
                  <td className="code">{codeLabel(c.code)}</td>
                  <td>{c.name}</td>
                  <td className="num">{c.credits}</td>
                  <td className="num">{c.hours[0]}</td>
                  <td className="num">{c.hours[1]}</td>
                  <td className="num">{c.hours[2]}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td /><td>Total</td><td className="num">{credits}</td><td /><td /><td /></tr></tfoot>
          </table>
        </div>

        <h3 className="notes-heading">Courses in detail</h3>
        <div className="syllabus-courses">
          {semester.courses.map((c) => {
            const pdf = syllabusLink(c);
            const elective = c.subject?.electiveSlot;
            return (
              <article key={c.code + c.name} className="syllabus-course">
                <header>
                  <span className="subject-card-code">{elective ? 'Elective' : c.code}</span>
                  <h4>{c.name}</h4>
                  <span className="syllabus-course-meta">{c.credits} credits · L {c.hours[0]} · T {c.hours[1]} · P {c.hours[2]}</span>
                </header>
                <p>
                  {elective
                    ? 'Choose one elective offered by your college. Notes for the electives are in the Electives collection.'
                    : c.subject?.description ?? 'Course details will be added soon.'}
                </p>
                <div className="syllabus-course-links">
                  {elective ? (
                    <Link to="/electives"><Layers size={14} /> Browse electives</Link>
                  ) : c.subject && c.noteSemester ? (
                    <Link to={subjectPath(c.noteSemester, c.subject)}><BookOpen size={14} /> Notes ({c.subject.files.length} files)</Link>
                  ) : null}
                  {pdf && <Link to={pdf}><FileText size={14} /> Detailed syllabus</Link>}
                </div>
              </article>
            );
          })}
        </div>

        <CiteThis title={`${semester.label} syllabus, Pokhara University BE Computer Engineering`} path={syllabusPath(semester.id)} />

        <nav className="syllabus-pager">
          {prev ? <Link to={syllabusPath(prev.id)}><ArrowLeft size={15} /> {prev.label}</Link> : <span />}
          <Link to="/pu-grading-system"><GraduationCap size={15} /> How grading works</Link>
          {next ? <Link to={syllabusPath(next.id)}>{next.label} <ArrowRight size={15} /></Link> : <span />}
        </nav>
      </section>
    </>
  );
}
