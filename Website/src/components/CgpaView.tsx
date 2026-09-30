import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, Calculator, CheckCircle2, Download, ExternalLink, FileUp, GraduationCap, HardDrive, Info, Loader2, RotateCcw, TriangleAlert } from 'lucide-react';
import { Link } from '@/components/Link';
import { CgpaUploadDialog } from '@/components/CgpaUploadDialog';
import { ElectiveInput } from '@/components/ElectiveInput';
import { curriculumSemesters, electiveNames } from '@/content/notes';
import { DEANS_LIST_GPA, DISTINCTION_CGPA, GRADES, GRADING_SOURCE, MIN_CGPA, formatGpa, gradePoint, gradeRange } from '@/content/grades';
import { cleanEntries, computeResults, emptyEntry, hasEntries, isElectiveSlot, type Entries, type SemesterEntry } from '@/content/cgpa';
import { saveBlob } from '@/content/watermark';
import { deviceStore, openCookieSettings, useConsent } from '@/content/consent';

const STORAGE_KEY = 'bece-cgpa-v1';

function loadEntries(): Entries {
  try {
    return cleanEntries(JSON.parse(deviceStore.get(STORAGE_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function CgpaView() {
  const [entries, setEntries] = useState<Entries>(loadEntries);
  const { consent } = useConsent();

  // Remembered on this device (with cookie consent) so students can come back each semester;
  // without consent the grades last for this visit only.
  useEffect(() => {
    deviceStore.set(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const update = (id: number, change: (entry: SemesterEntry) => SemesterEntry) =>
    setEntries((prev) => ({ ...prev, [id]: change(prev[id] ?? emptyEntry()) }));

  const { results, counted, cgpa, earned, programCredits, failed, best } = useMemo(() => computeResults(entries), [entries]);

  // PDF report: download what's entered, or upload an earlier report to carry on from it.
  const [busy, setBusy] = useState<'download' | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const closeUpload = useCallback(() => setUploadOpen(false), []);

  const downloadReport = async () => {
    setBusy('download');
    setNotice(null);
    try {
      const { createReport, reportFileName } = await import('@/content/cgpaReport');
      saveBlob(new Blob([(await createReport(entries)) as BlobPart], { type: 'application/pdf' }), reportFileName());
    } catch {
      setNotice({ tone: 'error', text: 'Couldn’t create the PDF. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const loadReport = ({ entries: loaded, generated }: { entries: Entries; generated: Date | null }) => {
    setEntries(loaded);
    setUploadOpen(false);
    const semesters = computeResults(loaded).counted.length;
    setNotice({
      tone: 'ok',
      text: `Loaded ${semesters} ${semesters === 1 ? 'semester' : 'semesters'}${generated ? ` from your report of ${generated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Fill in the rest to see your full CGPA.`,
    });
  };

  const standing = cgpa === null ? null
    : cgpa >= DISTINCTION_CGPA ? { tone: 'great', icon: <Award size={15} />, text: 'Distinction level' }
    : cgpa >= MIN_CGPA ? { tone: 'ok', icon: <GraduationCap size={15} />, text: `Above the ${MIN_CGPA.toFixed(1)} minimum CGPA` }
    : { tone: 'low', icon: <TriangleAlert size={15} />, text: `Below the ${MIN_CGPA.toFixed(1)} minimum CGPA` };

  const hasAnything = hasEntries(entries);

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
          <div className="cgpa-intro-actions">
            <button className="cgpa-action cgpa-action-primary" onClick={downloadReport} disabled={!hasAnything || busy !== null} title={hasAnything ? 'Download your grades and CGPA as a PDF' : 'Enter a grade first'}>
              {busy === 'download' ? <Loader2 size={14} className="spin" /> : <Download size={14} />} Download PDF
            </button>
            <button className="cgpa-action" onClick={() => { setNotice(null); setUploadOpen(true); }} disabled={busy !== null} title="Load a CGPA report PDF downloaded from this page">
              <FileUp size={14} /> Upload report
            </button>
          {consent === 'accepted' ? (
            <details className="cgpa-storage">
              <summary><HardDrive size={13} /> Saved in this browser</summary>
              <p>
                Your grades stay here when you come back on the same device and browser. They don't carry over to other
                browsers or devices, aren't kept in incognito windows, and are erased if you clear browsing data. Nothing is
                sent to our servers.
              </p>
            </details>
          ) : (
            <details className="cgpa-storage cgpa-storage-off">
              <summary><HardDrive size={13} /> Not saved: cookies off</summary>
              <p>
                Without cookie consent, your grades last only until you close or reload the site. Download the PDF to keep
                them, or <button className="cgpa-inline-link" onClick={openCookieSettings}>accept cookies</button> to save
                them in this browser.
              </p>
            </details>
          )}
          </div>
          {notice && (
            <p className={`cgpa-notice cgpa-notice-${notice.tone}`} role="status">
              {notice.tone === 'ok' ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />} {notice.text}
            </p>
          )}
        </div>
      </section>
      {uploadOpen && <CgpaUploadDialog onClose={closeUpload} onLoaded={loadReport} hasExisting={hasAnything} />}

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
                                  <ElectiveInput
                                    options={electiveNames}
                                    value={entry.electives[c.code] ?? ''}
                                    onChange={(value) => update(sem.id, (en) => ({ ...en, electives: { ...en.electives, [c.code]: value } }))}
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
