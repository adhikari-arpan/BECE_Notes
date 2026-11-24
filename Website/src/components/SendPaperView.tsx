import { useState, type FormEvent } from 'react';
import { CheckCircle2, FileCheck, FileUp, Github, Info, Loader2, Send, TriangleAlert, Upload, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { PageHero } from '@/components/PageHero';
import { pastPaperSubjects } from '@/content/curriculumData';
import { normalizeName, pastQuestionCollections } from '@/content/notes';
import { useLocation } from '@/content/router';
import './FeedbackView.css';
import './SendPaperView.css';

/** The largest PDF the server accepts (its requests are limited to 4.5 MB). */
const MAX_BYTES = 4 * 1024 * 1024;

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 2009 }, (_, i) => thisYear - i);

/**
 * The papers the collection already has, per subject folder: "2024_Fall", from file names like
 * `2024_Fall_DBMS.pdf`. The form marks those as already here; the server checks again when sending.
 */
const HAVE = new Map<string, Set<string>>();
for (const collection of pastQuestionCollections) {
  for (const f of collection.files) {
    const top = f.folder.split('/')[0];
    const m = /^(\d{4})_(spring|fall)_/i.exec(f.name);
    if (!top || !m) continue;
    const key = normalizeName(top);
    const set = HAVE.get(key) ?? new Set<string>();
    set.add(`${m[1]}_${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()}`);
    HAVE.set(key, set);
  }
}

const mb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * /send-paper: send a Pokhara University past paper (PDF) without GitHub. Pick the subject, the exam
 * (year and term) and the file; it's named for the collection (`2024_Fall_DBMS.pdf`) and sent to
 * api/send-paper.ts, which opens a pull request for review. Nothing is published until it's merged.
 */
export function SendPaperView() {
  const { params } = useLocation();
  const preset = params.get('subject');
  const [folder, setFolder] = useState(() => pastPaperSubjects.find((s) => s.folder === preset)?.folder ?? '');
  const [year, setYear] = useState('');
  const [term, setTerm] = useState<'' | 'Spring' | 'Fall'>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ files: string[]; pullRequest?: string } | null>(null);

  const subject = pastPaperSubjects.find((s) => s.folder === folder);
  const have = subject ? HAVE.get(normalizeName(subject.folder)) : undefined;
  const taken = (y: string | number, t: string) => !!have?.has(`${y}_${t}`);
  const duplicate = !!(year && term && taken(year, term));
  const fileName = subject && year && term ? `${year}_${term}_${subject.short}.pdf` : '';

  const fail = (message: string) => {
    setError(message);
    setStatus('error');
  };

  const pick = (list: FileList | null) => {
    const chosen = list?.[0];
    setFile(null);
    setError('');
    setStatus('idle');
    if (!chosen) return;
    if (list.length > 1) return fail('One PDF per paper, please.');
    if (!(chosen.type === 'application/pdf' || /\.pdf$/i.test(chosen.name))) return fail('Only PDF files can be sent. Scan the paper into one PDF first (any scanner app can).');
    if (chosen.size > MAX_BYTES) {
      return fail(`This PDF is ${mb(chosen.size)}. Please compress it under 4 MB (most scanner apps have a "compress" or "smaller size" option) and pick it again.`);
    }
    setFile(chosen);
  };

  const ready = !!(subject && year && term && file && consent) && !duplicate && status !== 'sending';

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready || !subject || !file) return;
    setStatus('sending');
    setError('');
    const body = new FormData();
    body.set('subject', subject.folder);
    body.set('short', subject.short);
    body.set('year', year);
    body.set('term', term);
    body.set('name', name.trim());
    body.set('college', college.trim());
    body.set('email', email.trim());
    // The subject's past questions page (same address as pastSubjectPath), linked in the "it's live" email.
    body.set('page', `/past-questions/semester-${subject.semester}/${subject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
    body.set('consent', 'yes');
    body.set('website', String(new FormData(e.currentTarget).get('website') ?? ''));
    body.append('file', file, fileName);
    try {
      const res = await fetch('/api/send-paper', { method: 'POST', body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; files?: string[]; pullRequest?: string } | null;
      if (res.ok && data?.ok) {
        setResult({ files: data.files ?? [fileName], pullRequest: data.pullRequest });
        setStatus('sent');
        return;
      }
      fail(data?.error ?? (res.status === 413 ? 'That’s too big: the PDF can be 4 MB at most.' : 'Couldn’t send the paper. Please try again.'));
    } catch {
      fail('Couldn’t reach the server. Check your connection and try again.');
    }
  };

  const another = () => {
    setYear('');
    setTerm('');
    setFile(null);
    setResult(null);
    setStatus('idle');
  };

  return (
    <>
      <section className="semester-page-header content-page-header section-wrap pqi-header">
        <PageHero
          title={<>Send a <em>Past Paper</em></>}
          kicker="No GitHub needed"
          lead="Have a Pokhara University exam paper? Send it here and it’s added to the collection after a quick check."
        />
      </section>

      <section className="section-wrap feedback-wrap">
        {status === 'sent' && result ? (
          <div className="feedback-card feedback-done" role="status">
            <CheckCircle2 size={40} />
            <h3>Thank you{name.trim() ? `, ${name.trim()}` : ''}!</h3>
            <p>
              Your paper was sent as <strong>{result.files.join(', ')}</strong>. It goes live on the site once it’s been checked,
              usually within a few days.{email.trim() ? ' We’ve emailed you a confirmation, and we’ll email again when it’s live.' : ''}
            </p>
            <div className="feedback-done-actions">
              <button type="button" className="feedback-secondary" onClick={another}>Send another paper</button>
              {result.pullRequest && (
                <a className="feedback-secondary" href={result.pullRequest} target="_blank" rel="noreferrer"><Github size={14} /> &nbsp;Follow it on GitHub</a>
              )}
              <Link to="/past-questions" className="feedback-secondary">Past questions</Link>
            </div>
          </div>
        ) : (
          <form className="feedback-card" onSubmit={submit}>
            <p className="feedback-intro">
              <FileUp size={18} />
              <span>
                <strong>Pokhara University exam papers</strong> only for now (not internal or college assessments), as one PDF
                under 4 MB. It’s named for the collection automatically and checked before it goes live. Prefer GitHub?
                See <Link to="/contributing#past-question-papers">the guide</Link>.
              </span>
            </p>

            <label className="feedback-field">
              <span>Subject</span>
              <select value={folder} onChange={(e) => setFolder(e.target.value)} required>
                <option value="" disabled>Choose the subject</option>
                {pastPaperSubjects.map((s) => (
                  <option key={s.folder} value={s.folder}>{s.name.replace(/&/g, 'and')} ({s.short})</option>
                ))}
              </select>
            </label>

            <div className="sendpaper-row">
              <label className="feedback-field">
                <span>Year of the exam</span>
                <select value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="" disabled>Year (AD)</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}{taken(y, 'Spring') && taken(y, 'Fall') ? ' (both terms already here)' : ''}</option>
                  ))}
                </select>
              </label>
              <fieldset className="feedback-field">
                <legend>Term</legend>
                <div className="sendpaper-terms">
                  {(['Spring', 'Fall'] as const).map((t) => {
                    const got = !!year && taken(year, t);
                    return (
                      <label key={t} className={`sendpaper-term ${term === t ? 'is-active' : ''} ${got ? 'is-taken' : ''}`} title={got ? `We already have the ${t} ${year} paper` : undefined}>
                        <input type="radio" name="term" value={t} checked={term === t} onChange={() => setTerm(t)} />
                        <span>{t}</span>
                        {got && <small>Already here</small>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {duplicate && subject && (
              <p className="sendpaper-note" role="status">
                <Info size={15} /> We already have the {term} {year} {subject.name.replace(/&/g, 'and')} paper. Thank you! Pick another year or term.
              </p>
            )}

            <div className="feedback-field">
              <span>The paper (PDF)</span>
              <label
                className={`sendpaper-drop ${file ? 'has-file' : ''} ${dragging ? 'is-dragging' : ''}`}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDrop={() => setDragging(false)}
              >
                {/* Covers the whole box, so a click or a dropped file lands on it. */}
                <input type="file" accept=".pdf,application/pdf" onClick={(e) => { e.currentTarget.value = ''; }} onChange={(e) => pick(e.target.files)} />
                <span className="sendpaper-drop-icon">{file ? <FileCheck size={24} /> : <Upload size={24} />}</span>
                <strong>{file ? `${file.name} · ${mb(file.size)}` : 'Choose the PDF'}</strong>
                <small>{file ? 'Click to choose a different file' : 'One PDF, under 4 MB. Click to browse, or drop it here.'}</small>
                {file && (
                  <button type="button" className="sendpaper-clear" onClick={(e) => { e.preventDefault(); setFile(null); }} aria-label="Remove the file"><X size={15} /></button>
                )}
              </label>
              {file && fileName && <small>Saved as <code>{fileName}</code> in <code>{subject?.folder}/</code></small>}
            </div>

            <div className="sendpaper-row">
              <label className="feedback-field">
                <span>Your name <small>(optional, for credit)</small></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Leave empty to stay anonymous" autoComplete="name" />
              </label>
              <label className="feedback-field">
                <span>College <small>(optional)</small></span>
                <input type="text" value={college} onChange={(e) => setCollege(e.target.value.slice(0, 60))} placeholder="e.g. NCIT" autoComplete="organization" />
              </label>
            </div>

            <label className="feedback-field">
              <span>Email <small>(optional: we’ll tell you when it’s live)</small></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} placeholder="you@example.com" autoComplete="email" inputMode="email" />
              <small>Only used for two emails about this paper: “received” and “it’s live”. Never shown or shared.</small>
            </label>

            <label className="sendpaper-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>This is a Pokhara University exam paper that can be shared freely. If you add your name, it’s shown with the paper on GitHub.</span>
            </label>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="feedback-trap" aria-hidden="true" />

            {status === 'error' && <p className="feedback-error" role="alert"><TriangleAlert size={15} /> {error}</p>}

            <button type="submit" className="feedback-submit" disabled={!ready}>
              {status === 'sending' ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
              {status === 'sending' ? 'Sending…' : 'Send the paper'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
