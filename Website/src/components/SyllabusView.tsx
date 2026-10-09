import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, FileText, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';
import { subjectPath } from '@/content/notes';
import { syllabusCode, syllabusLink, syllabusPath, syllabusSemesters } from '@/content/curriculum2025';
import { STRUCTURE_LABELS, useStructure, type Structure } from '@/content/structure';
import { saveBlob } from '@/content/watermark';
import './SyllabusView.css';

/** Downloads the syllabus shown (all semesters, or one) as a PDF, in the chosen curriculum order. */
function DownloadSyllabus({ structure, semesterId }: { structure: Structure; semesterId?: number }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const download = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const { createSyllabusPdf, syllabusFileName } = await import('@/content/syllabusReport');
      saveBlob(new Blob([(await createSyllabusPdf(structure, semesterId)) as BlobPart], { type: 'application/pdf' }), syllabusFileName(structure, semesterId));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="syllabus-download" onClick={download} disabled={busy} title={`Download ${semesterId ? 'this semester’s' : 'the full'} syllabus as a PDF`}>
        {busy ? <Loader2 size={14} className="spin" /> : <Download size={14} />} Download PDF
      </button>
      {failed && <span className="syllabus-download-error" role="alert">Couldn’t make the PDF. Please try again.</span>}
    </>
  );
}

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
          <div className="structure-bar"><StructureToggle /><DownloadSyllabus structure={structure} /></div>
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
                  {s.courses.map((c) => <li key={c.code + c.name}><span>{syllabusCode(c.code)}</span><span>{c.name}</span><span className="syllabus-card-credits">{c.credits} cr</span></li>)}
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
        <div className="structure-bar"><StructureToggle /><DownloadSyllabus structure={structure} semesterId={semester.id} /></div>
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
                  <td className="code">{syllabusCode(c.code)}</td>
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


        <nav className="syllabus-pager">
          {prev ? <Link to={syllabusPath(prev.id)}><ArrowLeft size={15} /> {prev.label}</Link> : <span />}
          <Link to="/pu-grading-system"><GraduationCap size={15} /> How grading works</Link>
          {next ? <Link to={syllabusPath(next.id)}>{next.label} <ArrowRight size={15} /></Link> : <span />}
        </nav>
      </section>
    </>
  );
}
