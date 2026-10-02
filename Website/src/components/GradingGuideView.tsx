import { ArrowLeft, Award, BookOpenCheck, Calculator, CalendarClock, ClipboardCheck, ExternalLink, GraduationCap, HelpCircle, Hourglass, Repeat, Scale, Sigma, Users } from 'lucide-react';
import { Link } from '@/components/Link';
import { GRADES, gradeRange } from '@/content/grades';
import { PU_FAQS, PU_GUIDE_PATH, PU_GUIDE_SOURCE, PU_GUIDE_TITLE } from '@/content/puGuide';
import { CiteThis } from '@/components/CiteThis';

/** Worked example: one semester's SGPA. */
const SGPA_EXAMPLE = [
  { name: 'Calculus I', credits: 3, grade: 'A-', point: 3.7 },
  { name: 'Programming in C', credits: 3, grade: 'B+', point: 3.3 },
  { name: 'Communication Techniques', credits: 2, grade: 'A', point: 4.0 },
  { name: 'Computer Workshop', credits: 1, grade: 'B', point: 3.0 },
];
const sgpaCredits = SGPA_EXAMPLE.reduce((s, r) => s + r.credits, 0);
const sgpaPoints = SGPA_EXAMPLE.reduce((s, r) => s + r.credits * r.point, 0);

/** Worked example: CGPA over three semesters with different credit loads. */
const CGPA_EXAMPLE = [
  { sem: 'Semester I', credits: 15, sgpa: 3.4 },
  { sem: 'Semester II', credits: 15, sgpa: 3.1 },
  { sem: 'Semester III', credits: 18, sgpa: 3.6 },
];
const cgpaCredits = CGPA_EXAMPLE.reduce((s, r) => s + r.credits, 0);
const cgpaPoints = CGPA_EXAMPLE.reduce((s, r) => s + r.credits * r.sgpa, 0);
const simpleAverage = CGPA_EXAMPLE.reduce((s, r) => s + r.sgpa, 0) / CGPA_EXAMPLE.length;

export function GradingGuideView() {
  return (
    <>
      <section className="semester-page-header content-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Student guide · Pokhara University</span>
            <h2>PU Grading System, SGPA &amp; CGPA</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-section">
            <p className="content-page-lead">
              Everything a Pokhara University undergraduate (including BE Computer / BECE) needs to know about how marks
              become grades, and grades become SGPA and CGPA. Want the number straight away? Use the{' '}
              <Link to="/cgpa-calculator">CGPA calculator</Link>.
            </p>
            <nav className="guide-toc" aria-label="On this page">
              {[
                ['evaluation', 'Internal & external marks'], ['scale', 'Grading scale'], ['sgpa', 'SGPA'], ['cgpa', 'CGPA'],
                ['standing', 'Minimum CGPA & honours'], ['retake', 'Retakes & incomplete'], ['rules', 'Semester rules'], ['faq', 'FAQ'],
              ].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
          </div>

          <div className="content-page-section" id="evaluation">
            <h3><Scale size={18} /> Internal and external evaluation</h3>
            <p>Every course is evaluated in two parts, and you must pass <strong>both separately</strong>:</p>
            <div className="course-table-wrap">
              <table className="course-table">
                <thead><tr><th>Part</th><th>Who evaluates</th><th className="num">Weight</th><th className="num">Pass mark</th></tr></thead>
                <tbody>
                  <tr><td><strong>Internal</strong> (IEM)</td><td>Your subject teacher, through quizzes, tutorials, lab work, assignments, class tests, participation and term papers</td><td className="num">50%</td><td className="num">45%</td></tr>
                  <tr><td><strong>External</strong> (EEM)</td><td>The Office of the Controller of Examinations, through the semester-end examination</td><td className="num">50%</td><td className="num">45%</td></tr>
                </tbody>
              </table>
            </div>
            <p className="guide-formula">Final score = 0.50 × Internal marks + 0.50 × External marks</p>
            <ul>
              <li>Fail the <strong>internal</strong> evaluation and you are <strong>“Not Qualified”</strong> to sit that course’s semester-end exam.</li>
              <li>Fail the <strong>external</strong> exam (below 45%) and the course is an <strong>F</strong>, whatever your internal marks.</li>
            </ul>
            <div className="guide-example">
              <strong>Example</strong>
              <p>Internal 76, external 58 → both are 45 or more, so you pass. Final = 0.5 × 76 + 0.5 × 58 = <b>67</b> → grade <b>C+ (2.3)</b>.</p>
              <p>Internal 80, external 40 → the external is below 45, so the course is an <b>F</b>, even though the average would be 60.</p>
            </div>
            <p className="guide-muted">Graduate (master’s) programs use 60% internal + 40% external, with 60% pass marks in each.</p>
          </div>

          <div className="content-page-section" id="scale">
            <h3><ClipboardCheck size={18} /> Grading scale (undergraduate)</h3>
            <div className="course-table-wrap">
              <table className="course-table">
                <thead><tr><th>Grade</th><th className="num">Grade point</th><th>Final score</th><th>Meaning</th></tr></thead>
                <tbody>
                  {GRADES.map((g, i) => (
                    <tr key={g.letter} className={g.letter === 'F' ? 'guide-row-fail' : ''}>
                      <td className="code">{g.letter}</td>
                      <td className="num">{g.point.toFixed(1)}</td>
                      <td>{gradeRange(i)}</td>
                      <td>{g.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-page-section" id="sgpa">
            <h3><Sigma size={18} /> How SGPA is calculated</h3>
            <p><strong>SGPA</strong> (Semester Grade Point Average) is the grade point average of one semester, weighted by credit hours:</p>
            <p className="guide-formula">SGPA = Σ (credit hours × grade point) ÷ Σ credit hours</p>
            <div className="course-table-wrap">
              <table className="course-table">
                <thead><tr><th>Subject</th><th className="num">Credits</th><th>Grade</th><th className="num">Credits × point</th></tr></thead>
                <tbody>
                  {SGPA_EXAMPLE.map((r) => (
                    <tr key={r.name}><td>{r.name}</td><td className="num">{r.credits}</td><td>{r.grade} ({r.point.toFixed(1)})</td><td className="num">{(r.credits * r.point).toFixed(1)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td>Total</td><td className="num">{sgpaCredits}</td><td /><td className="num">{sgpaPoints.toFixed(1)}</td></tr></tfoot>
              </table>
            </div>
            <div className="guide-example"><p>SGPA = {sgpaPoints.toFixed(1)} ÷ {sgpaCredits} = <b>{(sgpaPoints / sgpaCredits).toFixed(2)}</b></p></div>
          </div>

          <div className="content-page-section" id="cgpa">
            <h3><Calculator size={18} /> How CGPA is calculated</h3>
            <p>
              <strong>CGPA</strong> (Cumulative Grade Point Average) is the same calculation over all semesters together. Each
              semester counts by its credit hours, so CGPA is <strong>not</strong> just the average of your SGPAs.
            </p>
            <p className="guide-formula">CGPA = Σ (SGPA × semester credits) ÷ Σ semester credits</p>
            <div className="course-table-wrap">
              <table className="course-table">
                <thead><tr><th>Semester</th><th className="num">Credits</th><th className="num">SGPA</th><th className="num">SGPA × credits</th></tr></thead>
                <tbody>
                  {CGPA_EXAMPLE.map((r) => (
                    <tr key={r.sem}><td>{r.sem}</td><td className="num">{r.credits}</td><td className="num">{r.sgpa.toFixed(2)}</td><td className="num">{(r.credits * r.sgpa).toFixed(1)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td>Total</td><td className="num">{cgpaCredits}</td><td /><td className="num">{cgpaPoints.toFixed(1)}</td></tr></tfoot>
              </table>
            </div>
            <div className="guide-example">
              <p>CGPA = {cgpaPoints.toFixed(1)} ÷ {cgpaCredits} = <b>{(cgpaPoints / cgpaCredits).toFixed(2)}</b></p>
              <p>A simple average of the three SGPAs would give {simpleAverage.toFixed(2)}, which is slightly off, because Semester III has more credits.</p>
            </div>
            <Link to="/cgpa-calculator" className="guide-cta"><Calculator size={16} /> Calculate your CGPA with every subject’s credits</Link>
          </div>

          <div className="content-page-section" id="standing">
            <h3><Award size={18} /> Minimum CGPA, distinction and Dean’s List</h3>
            <div className="guide-cards">
              <div><span>Minimum CGPA</span><strong>2.0</strong><small>Expected to continue and graduate. Students unlikely to maintain it may be dismissed.</small></div>
              <div><span>Degree with distinction</span><strong>3.60+</strong><small>CGPA of 3.60 or better.</small></div>
              <div><span>Dean’s List</span><strong>3.7+</strong><small>CGPA of at least 3.7.</small></div>
            </div>
            <p className="guide-muted">Graduate programs: minimum 3.0, distinction 3.75, Dean’s List 3.8.</p>
          </div>

          <div className="content-page-section" id="retake">
            <h3><Repeat size={18} /> Retakes and incomplete grades</h3>
            <ul>
              <li>A course can be taken only once for a grade, <strong>unless you fail it</strong>. A failed course must be retaken when the college offers it.</li>
              <li>To reach the minimum CGPA of 2.0, you may retake at most <strong>two passed courses</strong> within the program’s maximum duration.</li>
              <li>The grade from the retake <strong>replaces</strong> the earlier grade.</li>
              <li>In rare cases a course can get an <strong>“I” (incomplete)</strong> grade. If the work isn’t completed within the following semester, it automatically becomes an <strong>F</strong>.</li>
            </ul>
          </div>

          <div className="content-page-section" id="rules">
            <h3><CalendarClock size={18} /> Semester rules at a glance</h3>
            <div className="guide-facts">
              <div><BookOpenCheck size={16} /><span><strong>Semesters:</strong> two per year, 16 weeks each: fall from September, spring from March.</span></div>
              <div><Hourglass size={16} /><span><strong>Credit hour:</strong> one lecture hour per week for a semester, so a 3-credit course is about 48 class hours.</span></div>
              <div><Users size={16} /><span><strong>Attendance:</strong> at least 80% of classes held. More than four weeks’ continuous absence without notice can get you removed from the rolls.</span></div>
              <div><ClipboardCheck size={16} /><span><strong>Course load:</strong> register every course of your semester, plus up to three retake courses (four in the final year).</span></div>
              <div><CalendarClock size={16} /><span><strong>Add or withdraw:</strong> petition the principal’s office in the first week; withdrawing from a course is allowed within the first month.</span></div>
              <div><GraduationCap size={16} /><span><strong>Maximum duration:</strong> a 4-year (8-semester) technical degree like BE must be finished within 8 years (16 semesters).</span></div>
              <div><Scale size={16} /><span><strong>Credit transfer:</strong> up to 25% of credits from an equivalent recognised program (grade B or better, within five years); within PU, compatible courses with at least C.</span></div>
              <div><HelpCircle size={16} /><span><strong>Semester withdrawal:</strong> only on medical grounds, for the whole semester. Using unfair means can bring an F or dismissal.</span></div>
            </div>
          </div>

          <div className="content-page-section" id="faq">
            <h3><HelpCircle size={18} /> Frequently asked questions</h3>
            <div className="guide-faq">
              {PU_FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <CiteThis title={PU_GUIDE_TITLE} path={PU_GUIDE_PATH} />
          <p className="guide-source">
            Source: <a href={PU_GUIDE_SOURCE.url} target="_blank" rel="noreferrer">{PU_GUIDE_SOURCE.title} <ExternalLink size={12} /></a>,
            retrieved {PU_GUIDE_SOURCE.retrieved}. This is a student-friendly summary; the university’s own rules and notices are final.
          </p>
        </div>
      </section>
    </>
  );
}
