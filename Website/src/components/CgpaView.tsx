import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, Calculator, CheckCircle2, Download, ExternalLink, FileUp, GraduationCap, HardDrive, Info, Loader2, Plus, RotateCcw, Trash2, TriangleAlert, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { CgpaUploadDialog } from '@/components/CgpaUploadDialog';
import { ElectiveInput } from '@/components/ElectiveInput';
import { electiveNames } from '@/content/notes';
import { DEANS_LIST_GPA, DISTINCTION_CGPA, GRADES, GRADING_SOURCE, MIN_CGPA, formatGpa, gradePoint, gradeRange } from '@/content/grades';
import { cleanEntries, computeResults, curriculumFor, emptyEntry, hasEntries, isElectiveSlot, type Entries, type SemesterEntry } from '@/content/cgpa';
import { setStructure, useStructure, type Structure } from '@/content/structure';
import {
  MODE_LABELS, cleanCustom, parseBatch, termFor, customToCurriculum, emptyCustomSemester, hasCustomData, newCustomCourse, parseCredits,
  type CgpaMode, type CustomData, type CustomSemester,
} from '@/content/cgpaCustom';
import { saveBlob } from '@/content/watermark';
import { deviceStore, openCookieSettings, useConsent } from '@/content/consent';
import './CgpaView.css';

/** Grades are kept separately per curriculum (course codes differ between orders), and for Custom. */
const storageKey = (mode: CgpaMode) => (mode === 'custom' ? 'bece-cgpa-custom-v1' : mode === '2025' ? 'bece-cgpa-2025-v1' : 'bece-cgpa-v1');
/** Whether the calculator was last on Custom (the two curriculum orders follow the site-wide switch). */
const MODE_KEY = 'bece-notes:cgpa-mode';
/** The student's batch year (e.g. 2023), shared by all modes. */
const BATCH_KEY = 'bece-notes:cgpa-batch';
/** Batch years to choose from: the current year back to 2020, newest first (follows the visitor's date). */
const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: CURRENT_YEAR - 2020 + 1 }, (_, i) => CURRENT_YEAR - i);

function loadCustom(): CustomData {
  try {
    return cleanCustom(JSON.parse(deviceStore.get(storageKey('custom')) ?? '{}'));
  } catch {
    return {};
  }
}

function loadEntries(structure: Structure): Entries {
  try {
    return cleanEntries(JSON.parse(deviceStore.get(storageKey(structure)) ?? '{}'), curriculumFor(structure));
  } catch {
    return {};
  }
}

type Notice = { tone: 'ok' | 'error'; text: string };
/** A message to show after switching curriculum to load a report (the calculator remounts). */
let pendingNotice: Notice | null = null;

/**
 * The calculator follows the chosen curriculum (the site-wide switch), or Custom, where students add
 * their own subjects. Switching starts a fresh calculator with that mode's saved grades.
 */
export function CgpaView() {
  const structure = useStructure();
  const [custom, setCustom] = useState(() => deviceStore.get(MODE_KEY) === 'custom');
  const mode: CgpaMode = custom ? 'custom' : structure;
  const choose = useCallback((next: CgpaMode) => {
    deviceStore.set(MODE_KEY, next === 'custom' ? 'custom' : 'curriculum');
    setCustom(next === 'custom');
    if (next !== 'custom') setStructure(next);
  }, []);
  return <CgpaCalculator key={mode} mode={mode} onMode={choose} />;
}

/** "Before 2025 batch | 2025 batch onwards | Custom" — styled like the site's curriculum switch. */
function ModeToggle({ mode, onMode }: { mode: CgpaMode; onMode: (m: CgpaMode) => void }) {
  return (
    <div className="structure-toggle" role="radiogroup" aria-label="Which subjects to use">
      {(Object.keys(MODE_LABELS) as CgpaMode[]).map((m) => (
        <button key={m} role="radio" aria-checked={mode === m} onClick={() => onMode(m)}>{MODE_LABELS[m]}</button>
      ))}
    </div>
  );
}

function CgpaCalculator({ mode, onMode }: { mode: CgpaMode; onMode: (m: CgpaMode) => void }) {
  const isCustom = mode === 'custom';
  const [curriculumEntries, setEntries] = useState<Entries>(() => (isCustom ? {} : loadEntries(mode)));
  const [customData, setCustomData] = useState<CustomData>(() => (isCustom ? loadCustom() : {}));
  const derived = useMemo(() => (isCustom ? customToCurriculum(customData) : null), [isCustom, customData]);
  const sems = derived ? derived.sems : curriculumFor(mode as Structure);
  const entries = derived ? derived.entries : curriculumEntries;
  const { consent } = useConsent();
  const [batchText, setBatchText] = useState(() => deviceStore.get(BATCH_KEY) ?? '');
  const batch = parseBatch(batchText);
  useEffect(() => {
    deviceStore.set(BATCH_KEY, batchText);
  }, [batchText]);

  // Remembered on this device (with cookie consent) so students can come back each semester;
  // without consent the grades last for this visit only.
  useEffect(() => {
    deviceStore.set(storageKey(mode), JSON.stringify(isCustom ? customData : curriculumEntries));
  }, [curriculumEntries, customData, isCustom, mode]);

  const update = (id: number, change: (entry: SemesterEntry) => SemesterEntry) =>
    setEntries((prev) => ({ ...prev, [id]: change(prev[id] ?? emptyEntry()) }));
  /** Custom mode: change one semester's subjects / typed SGPA. */
  const patchCustom = (id: number, change: (sem: CustomSemester) => CustomSemester) =>
    setCustomData((prev) => ({ ...prev, [id]: change(prev[id] ?? emptyCustomSemester()) }));
  const setSgpa = (id: number, sgpa: string) => (isCustom ? patchCustom(id, (s) => ({ ...s, sgpa })) : update(id, (en) => ({ ...en, sgpa })));

  const { results, counted, cgpa, earned, programCredits, failed, best } = useMemo(() => computeResults(entries, sems), [entries, sems]);

  // PDF report: download what's entered, or upload an earlier report to carry on from it.
  const [busy, setBusy] = useState<'download' | null>(null);
  const [notice, setNotice] = useState<Notice | null>(() => {
    const n = pendingNotice;
    pendingNotice = null;
    return n;
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const closeUpload = useCallback(() => setUploadOpen(false), []);

  const downloadReport = async () => {
    setBusy('download');
    setNotice(null);
    try {
      const { createReport, reportFileName } = await import('@/content/cgpaReport');
      saveBlob(new Blob([(await createReport(entries, mode, customData, batch)) as BlobPart], { type: 'application/pdf' }), reportFileName());
    } catch {
      setNotice({ tone: 'error', text: 'Couldn’t create the PDF. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const loadReport = ({ entries: loaded, generated, structure: reportStructure, custom: loadedCustom, semesters, batch: loadedBatch }: { entries: Entries; generated: Date | null; structure: CgpaMode; custom?: CustomData; semesters: number; batch: number | null }) => {
    setUploadOpen(false);
    if (loadedBatch) {
      setBatchText(String(loadedBatch));
      deviceStore.set(BATCH_KEY, String(loadedBatch));
    }
    const loadedNotice: Notice = {
      tone: 'ok',
      text: `Loaded ${semesters} ${semesters === 1 ? 'semester' : 'semesters'}${generated ? ` from your report of ${generated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Fill in the rest to see your full CGPA.`,
    };
    if (reportStructure !== mode) {
      // A report made for another mode: save its grades there and switch to it.
      deviceStore.set(storageKey(reportStructure), JSON.stringify(reportStructure === 'custom' ? loadedCustom ?? {} : loaded));
      pendingNotice = loadedNotice;
      onMode(reportStructure);
      return;
    }
    if (isCustom) setCustomData(loadedCustom ?? {});
    else setEntries(loaded);
    setNotice(loadedNotice);
  };

  const standing = cgpa === null ? null
    : cgpa >= DISTINCTION_CGPA ? { tone: 'great', icon: <Award size={15} />, text: 'Distinction level' }
    : cgpa >= MIN_CGPA ? { tone: 'ok', icon: <GraduationCap size={15} />, text: `Above the ${MIN_CGPA.toFixed(1)} minimum CGPA` }
    : { tone: 'low', icon: <TriangleAlert size={15} />, text: `Below the ${MIN_CGPA.toFixed(1)} minimum CGPA` };

  const hasAnything = isCustom ? hasCustomData(customData) : hasEntries(entries);

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
          <span className="subject-count-pill">{sems.length} semesters · {programCredits} credits</span>
        </div>
        <div className="structure-bar">
          <ModeToggle mode={mode} onMode={onMode} />
          <label className="cgpa-batch">
            Batch
            <select
              value={batch ? String(batch) : ''}
              onChange={(e) => {
                const value = e.target.value;
                setBatchText(value);
                // The batch decides the subject order: 2025 and later → 2025 onwards, earlier → before 2025.
                // Custom stays custom. Saved first, because switching order reopens the calculator.
                deviceStore.set(BATCH_KEY, value);
                const year = parseBatch(value);
                if (year && !isCustom) {
                  const order = year >= 2025 ? '2025' : 'pre2025';
                  if (order !== mode) onMode(order);
                }
              }}
              aria-label="Your batch year, to show each semester's term (Fall / Spring)"
            >
              <option value="">Select batch</option>
              {BATCH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          {isCustom && <span className="structure-note-inline">Add your own subjects, credits and grades.</span>}
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
              <div><dt>Semesters</dt><dd>{counted.length}<small>/{sems.length}</small></dd></div>
              <div><dt>Best SGPA</dt><dd>{formatGpa(best)}</dd></div>
            </dl>

            <ul className="cgpa-sgpa-list" aria-label="SGPA by semester">
              {sems.map((sem, i) => (
                <li key={sem.id} className={results[i].sgpa === null ? 'muted' : ''}>
                  <span>{sem.label}{termFor(batch, sem.id) && <small className="cgpa-sgpa-term"> · {termFor(batch, sem.id)}</small>}</span>
                  <strong>{formatGpa(results[i].sgpa)}</strong>
                </li>
              ))}
            </ul>

            {failed > 0 && (
              <p className="cgpa-warning"><TriangleAlert size={14} /> {failed} failed {failed === 1 ? 'subject counts' : 'subjects count'} as 0.0 until you retake {failed === 1 ? 'it' : 'them'}.</p>
            )}
            {hasAnything && (
              <button className="cgpa-reset" onClick={() => window.confirm(isCustom ? 'Clear every subject and grade you entered?' : 'Clear every grade you entered?') && (isCustom ? setCustomData({}) : setEntries({}))}>
                <RotateCcw size={14} /> Reset all
              </button>
            )}
          </div>
        </aside>

        <div className="cgpa-semesters">
          {sems.map((sem, i) => {
            const entry = entries[sem.id] ?? emptyEntry();
            const result = results[i];
            const invalid = entry.sgpa.trim() !== '' && !result.typed;
            return (
              <article key={sem.id} className="cgpa-semester">
                <header className="cgpa-semester-head">
                  <div>
                    <span className="section-kicker">{sem.year}{termFor(batch, sem.id) ? ` · ${termFor(batch, sem.id)}` : ''}</span>
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
                      onChange={(e) => setSgpa(sem.id, e.target.value)}
                      aria-label={`${sem.label} SGPA — type it directly, or leave empty to calculate from grades`}
                    />
                    <small>{invalid ? '0 – 4 only' : result.typed ? 'entered directly' : 'or type it directly'}</small>
                  </label>
                </header>

                {result.typed && (
                  <p className="cgpa-typed-note">
                    Using the SGPA you entered ({formatGpa(result.sgpa)}) over {result.totalCredits ? `all ${result.totalCredits}` : 'the semester’s'} credits.{' '}
                    <button onClick={() => setSgpa(sem.id, '')}>Use subject grades instead</button>
                  </p>
                )}
                {isCustom ? (
                  <CustomSubjects
                    semesterLabel={sem.label}
                    data={customData[sem.id] ?? emptyCustomSemester()}
                    dimmed={result.typed}
                    onChange={(change) => patchCustom(sem.id, change)}
                  />
                ) : (
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
                )}
                <footer className="cgpa-semester-foot">
                  {result.credits} of {result.totalCredits} credits graded
                </footer>
              </article>
            );
          })}

          <article className="cgpa-semester cgpa-info">
            <h3><Info size={17} /> PU grading at a glance</h3>
            <p className="cgpa-guide-link">
              Want the full rules, with worked examples? Read the <Link to="/pu-grading-system">PU grading system guide</Link>.
            </p>
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

/** Custom mode: one semester's own subjects — name, credits, grade — with add / remove. */
function CustomSubjects({ semesterLabel, data, dimmed, onChange }: {
  semesterLabel: string;
  data: CustomSemester;
  dimmed: boolean;
  onChange: (change: (sem: CustomSemester) => CustomSemester) => void;
}) {
  const setCourse = (id: string, patch: Partial<CustomSemester['courses'][number]>) =>
    onChange((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const remove = (id: string) => onChange((s) => ({ ...s, courses: s.courses.filter((c) => c.id !== id) }));
  const add = () => onChange((s) => ({ ...s, courses: [...s.courses, newCustomCourse()] }));
  const typedWithoutSubjects = data.sgpa.trim() !== '' && data.courses.length === 0;

  return (
    <div className={`cgpa-custom ${dimmed ? 'cgpa-table-off' : ''}`}>
      {data.courses.length > 0 && (
        <div className="course-table-wrap">
          <table className="course-table cgpa-table cgpa-custom-table">
            <thead>
              <tr><th>Subject</th><th className="num">Credits</th><th>Grade</th><th className="num">Points</th><th aria-label="Remove" /></tr>
            </thead>
            <tbody>
              {data.courses.map((c, i) => {
                const credits = parseCredits(c.credits);
                const point = gradePoint(c.grade);
                return (
                  <tr key={c.id} className={c.grade === 'F' ? 'cgpa-row-failed' : ''}>
                    <td>
                      <input
                        className="cgpa-custom-name"
                        value={c.name}
                        maxLength={80}
                        placeholder={`Subject ${i + 1} name`}
                        onChange={(e) => setCourse(c.id, { name: e.target.value })}
                        aria-label={`${semesterLabel}: subject ${i + 1} name`}
                      />
                    </td>
                    <td className="num">
                      <input
                        className={`cgpa-custom-credits ${c.credits && credits === null ? 'invalid' : ''}`}
                        type="number"
                        inputMode="decimal"
                        min={0.5}
                        max={30}
                        step={0.5}
                        value={c.credits}
                        placeholder="3"
                        onChange={(e) => setCourse(c.id, { credits: e.target.value })}
                        aria-label={`${semesterLabel}: credits for subject ${i + 1}`}
                      />
                    </td>
                    <td>
                      <select
                        className={`cgpa-grade ${c.grade ? 'cgpa-grade-set' : ''}`}
                        value={c.grade}
                        onChange={(e) => setCourse(c.id, { grade: e.target.value })}
                        aria-label={`${semesterLabel}: grade for subject ${i + 1}`}
                      >
                        <option value="">—</option>
                        {GRADES.map((g) => <option key={g.letter} value={g.letter}>{g.letter} ({g.point.toFixed(1)})</option>)}
                      </select>
                    </td>
                    <td className="num">{point === undefined || credits === null ? <span className="muted">—</span> : (point * credits).toFixed(1)}</td>
                    <td className="num">
                      <button className="cgpa-custom-remove" onClick={() => remove(c.id)} aria-label={`Remove subject ${i + 1}`} title="Remove subject">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="cgpa-custom-actions">
        <button className="cgpa-custom-add" onClick={add}><Plus size={14} /> Add subject</button>
        {data.courses.length === 0 && !typedWithoutSubjects && (
          <span className="cgpa-custom-hint">No subjects yet: add them, or type this semester’s SGPA above.</span>
        )}
        {typedWithoutSubjects && (
          <label className="cgpa-custom-semcredits">
            Semester credits
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={30}
              value={data.credits}
              placeholder="18"
              onChange={(e) => onChange((s) => ({ ...s, credits: e.target.value }))}
              aria-label={`${semesterLabel}: total credits, used with the SGPA you typed`}
            />
            {!parseCredits(data.credits) && <X size={13} className="cgpa-custom-need" aria-label="Needed" />}
          </label>
        )}
      </div>
    </div>
  );
}
