import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, Calculator, ExternalLink, GraduationCap, HardDrive, Info, RotateCcw, TriangleAlert } from 'lucide-react';
import { Link } from '@/components/Link';
import { curriculumSemesters, electiveNames } from '@/content/notes';
import { DEANS_LIST_GPA, DISTINCTION_CGPA, GRADES, GRADING_SOURCE, MIN_CGPA, formatGpa, gpa, gradePoint, gradeRange } from '@/content/grades';

/** Per semester: grade picked for each course (by code), and/or a whole-semester SGPA typed in directly (it wins). */
interface SemesterEntry {
  grades: Record<string, string>;
  electives: Record<string, string>;
  sgpa: string;
}
type Entries = Record<number, SemesterEntry>;

const STORAGE_KEY = 'bece-cgpa-v1';
const emptyEntry = (): SemesterEntry => ({ grades: {}, electives: {}, sgpa: '' });

function loadEntries(): Entries {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Entries;
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

const isElectiveSlot = (code: string) => /^ELEC\b/.test(code);

/** A typed SGPA counts only when it's a real value between 0 and 4. */
function parseSgpa(text: string) {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 4 ? value : null;
}

export function CgpaView() {
  const [entries, setEntries] = useState<Entries>(loadEntries);

  // Remembered on this device so students can come back each semester.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Storage unavailable (private mode) — the calculator still works for this visit.
    }
  }, [entries]);

  const update = (id: number, change: (entry: SemesterEntry) => SemesterEntry) =>
    setEntries((prev) => ({ ...prev, [id]: change(prev[id] ?? emptyEntry()) }));

  const results = useMemo(() => curriculumSemesters.map((sem) => {
    const entry = entries[sem.id] ?? emptyEntry();
    const totalCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
    const graded = sem.courses
      .map((c) => ({ credits: c.credits, point: gradePoint(entry.grades[c.code] ?? '') }))
      .filter((c): c is { credits: number; point: number } => c.point !== undefined);
    const fromGrades = gpa(graded);
    // A typed SGPA (from the marksheet) counts over the whole semester's credits and replaces the subject grades.
    const typed = parseSgpa(entry.sgpa);
    if (typed !== null) return { id: sem.id, totalCredits, credits: totalCredits, sgpa: typed, fromGrades, typed: true, failed: 0 };
    return {
      id: sem.id,
      totalCredits,
      credits: graded.reduce((sum, c) => sum + c.credits, 0),
      sgpa: fromGrades,
      fromGrades,
      typed: false,
      failed: sem.courses.filter((c) => entry.grades[c.code] === 'F').length,
    };
  }), [entries]);

  const counted = results.filter((r) => r.sgpa !== null);
  const cgpa = gpa(counted.map((r) => ({ credits: r.credits, point: r.sgpa! })));
  const earned = counted.reduce((sum, r) => sum + r.credits, 0);
  const programCredits = results.reduce((sum, r) => sum + r.totalCredits, 0);
  const failed = results.reduce((sum, r) => sum + r.failed, 0);
  const best = counted.length ? Math.max(...counted.map((r) => r.sgpa!)) : null;

  const standing = cgpa === null ? null
    : cgpa >= DISTINCTION_CGPA ? { tone: 'great', icon: <Award size={15} />, text: `Distinction level (${DISTINCTION_CGPA.toFixed(2)}+)` }
    : cgpa >= MIN_CGPA ? { tone: 'ok', icon: <GraduationCap size={15} />, text: `Above the ${MIN_CGPA.toFixed(1)} minimum CGPA` }
    : { tone: 'low', icon: <TriangleAlert size={15} />, text: `Below the ${MIN_CGPA.toFixed(1)} minimum CGPA` };

  const hasAnything = Object.values(entries).some((e) => e.sgpa || Object.values(e.grades).some(Boolean));

  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Tools · Pokhara University BECE</span>
            <h2>CGPA Calculator</h2>
          </div>
          <span className="subject-count-pill">{curriculumSemesters.length} semesters · {programCredits} credits</span>
        </div>
        <div className="cgpa-intro">
          <p className="cgpa-lead">
            Pick a grade for each subject, or type a semester's <strong>SGPA</strong> directly. Your CGPA updates as you go.
          </p>
          <details className="cgpa-storage">
            <summary><HardDrive size={13} /> Saved in this browser</summary>
            <p>
              Your grades stay here when you come back on the same device and browser. They don't carry over to other
              browsers or devices, aren't kept in incognito windows, and are erased if you clear browsing data. Nothing is
              sent to our servers.
            </p>
          </details>
        </div>
      </section>

      <section className="cgpa-layout section-wrap">
        <aside className="cgpa-summary">
          <div className={`cgpa-summary-card ${standing ? `cgpa-summary-${standing.tone}` : ''}`}>
            <GraduationCap className="cgpa-summary-glyph" size={190} strokeWidth={1.2} aria-hidden="true" />
            <span className="cgpa-summary-label"><Calculator size={13} /> Your CGPA</span>
            <div className="cgpa-big">
              <strong className={`cgpa-value ${cgpa === null ? 'cgpa-value-empty' : ''}`}>{formatGpa(cgpa)}</strong>
              <span className="cgpa-scale">OUT OF 4.00</span>
            </div>
            {/* Where the CGPA sits between 0 and 4, with PU's pass and distinction marks. */}
            <div className="cgpa-meter" aria-hidden="true">
              <div className="cgpa-meter-track">
                <span className="cgpa-meter-fill" style={{ width: `${((cgpa ?? 0) / 4) * 100}%` }} />
                <span className="cgpa-meter-mark" style={{ left: `${(MIN_CGPA / 4) * 100}%` }} />
                <span className="cgpa-meter-mark" style={{ left: `${(DISTINCTION_CGPA / 4) * 100}%` }} />
              </div>
              <div className="cgpa-meter-labels">
                <span style={{ left: '0%' }}>0</span>
                <span style={{ left: `${(MIN_CGPA / 4) * 100}%` }}>{MIN_CGPA.toFixed(1)} min</span>
                <span style={{ left: `${(DISTINCTION_CGPA / 4) * 100}%` }}>{DISTINCTION_CGPA.toFixed(1)} dist.</span>
              </div>
            </div>
            {standing
              ? <span className={`cgpa-standing cgpa-standing-${standing.tone}`}>{standing.icon} {standing.text}</span>
              : <span className="cgpa-standing cgpa-standing-none">Pick a grade to start</span>}

            <dl className="cgpa-stats">
              <div><dt>Credits</dt><dd>{earned}<small>/{programCredits}</small></dd></div>
              <div><dt>Semesters</dt><dd>{counted.length}<small>/{curriculumSemesters.length}</small></dd></div>
              <div><dt>Best SGPA</dt><dd>{formatGpa(best)}</dd></div>
            </dl>

            <ul className="cgpa-sgpa-list" aria-label="SGPA by semester">
              {curriculumSemesters.map((sem, i) => (
                <li key={sem.id} className={results[i].sgpa === null ? 'muted' : ''}>
                  <span>{sem.label}</span>
                  <strong>{formatGpa(results[i].sgpa)}</strong>
                </li>
              ))}
            </ul>

            {failed > 0 && (
              <p className="cgpa-warning"><TriangleAlert size={14} /> {failed} failed {failed === 1 ? 'subject counts' : 'subjects count'} as 0.0 until you retake {failed === 1 ? 'it' : 'them'}.</p>
            )}
            {hasAnything && (
              <button className="cgpa-reset" onClick={() => window.confirm('Clear every grade you entered?') && setEntries({})}>
                <RotateCcw size={14} /> Reset all
              </button>
            )}
          </div>
        </aside>

        <datalist id="cgpa-elective-options">
          {electiveNames.map((name) => <option key={name} value={name} />)}
        </datalist>
        <div className="cgpa-semesters">
          {curriculumSemesters.map((sem, i) => {
            const entry = entries[sem.id] ?? emptyEntry();
            const result = results[i];
            const invalid = entry.sgpa.trim() !== '' && !result.typed;
            return (
              <article key={sem.id} className="cgpa-semester">
                <header className="cgpa-semester-head">
                  <div>
                    <span className="section-kicker">{sem.year}</span>
                    <h3>{sem.label}</h3>
                  </div>
                  <label className={`cgpa-sgpa-box ${result.typed ? 'cgpa-sgpa-box-typed' : ''} ${invalid ? 'cgpa-sgpa-box-invalid' : ''} ${result.fromGrades === null ? 'cgpa-sgpa-box-empty' : ''}`}>
                    <span>SGPA</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={4}
                      step={0.01}
                      placeholder={result.fromGrades === null ? '0.00' : formatGpa(result.fromGrades)}
                      value={entry.sgpa}
                      onChange={(e) => update(sem.id, (en) => ({ ...en, sgpa: e.target.value }))}
                      aria-label={`${sem.label} SGPA — type it directly, or leave empty to calculate from grades`}
                    />
                    <small>{invalid ? '0 – 4 only' : result.typed ? 'entered directly' : 'or type it directly'}</small>
                  </label>
                </header>

                {result.typed && (
                  <p className="cgpa-typed-note">
                    Using the SGPA you entered ({formatGpa(result.sgpa)}) over all {result.totalCredits} credits.{' '}
                    <button onClick={() => update(sem.id, (en) => ({ ...en, sgpa: '' }))}>Use subject grades instead</button>
                  </p>
                )}
                <div className={`course-table-wrap ${result.typed ? 'cgpa-table-off' : ''}`}>
                    <table className="course-table cgpa-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Subject</th>
                          <th className="num">Credits</th>
                          <th>Grade</th>
                          <th className="num">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.courses.map((c) => {
                          const grade = entry.grades[c.code] ?? '';
                          const point = gradePoint(grade);
                          return (
                            <tr key={c.code} className={grade === 'F' ? 'cgpa-row-failed' : ''}>
                              <td className="code">{c.code}</td>
                              <td>
                                {isElectiveSlot(c.code) ? (
                                  // Suggests the electives we know, but any subject name can be typed.
                                  <input
                                    className="cgpa-elective"
                                    list="cgpa-elective-options"
                                    value={entry.electives[c.code] ?? ''}
                                    onChange={(e) => update(sem.id, (en) => ({ ...en, electives: { ...en.electives, [c.code]: e.target.value } }))}
                                    placeholder={`${c.name}: pick or type a subject`}
                                    aria-label={`Which subject you took for ${c.name}`}
                                  />
                                ) : c.name}
                              </td>
                              <td className="num">{c.credits}</td>
                              <td>
                                <select
                                  className={`cgpa-grade ${grade ? 'cgpa-grade-set' : ''}`}
                                  value={grade}
                                  onChange={(e) => update(sem.id, (en) => ({ ...en, grades: { ...en.grades, [c.code]: e.target.value } }))}
                                  aria-label={`Grade in ${c.name}`}
                                >
                                  <option value="">—</option>
                                  {GRADES.map((g) => <option key={g.letter} value={g.letter}>{g.letter} ({g.point.toFixed(1)})</option>)}
                                </select>
                              </td>
                              <td className="num">{point === undefined ? <span className="muted">—</span> : (point * c.credits).toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                </div>
                <footer className="cgpa-semester-foot">
                  {result.credits} of {result.totalCredits} credits graded
                </footer>
              </article>
            );
          })}

          <article className="cgpa-semester cgpa-info">
            <h3><Info size={17} /> PU grading at a glance</h3>
            <ul className="cgpa-grade-chips" aria-label="Grade, grade point and final score">
              {GRADES.map((g, i) => (
                <li key={g.letter} className={g.letter === 'F' ? 'fail' : ''}>
                  <strong>{g.letter}</strong>
                  <span>{g.point.toFixed(1)}</span>
                  <small>{gradeRange(i)}%</small>
                </li>
              ))}
            </ul>
            <dl className="cgpa-facts">
              <dt>Final score</dt><dd>50% internal + 50% external · pass needs 45% in each</dd>
              <dt>SGPA / CGPA</dt><dd>Σ(credit × grade point) ÷ Σ credits · one semester / all semesters</dd>
              <dt>Fail (F)</dt><dd>Counts as 0.0 until retaken; the new grade replaces it</dd>
              <dt>Minimum CGPA</dt><dd>{MIN_CGPA.toFixed(1)} to stay in the program and graduate</dd>
              <dt>Distinction</dt><dd>CGPA {DISTINCTION_CGPA.toFixed(2)}+ · Dean's List {DEANS_LIST_GPA.toFixed(1)}+</dd>
            </dl>
            <p className="cgpa-source">
              Source: <a href={GRADING_SOURCE.url} target="_blank" rel="noreferrer">{GRADING_SOURCE.title} <ExternalLink size={12} /></a>
              {' '}· retrieved {GRADING_SOURCE.retrieved}. This calculator gives an estimate; your PU transcript is final.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
