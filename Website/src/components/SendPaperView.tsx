import { useState, type FormEvent } from 'react';
import { CheckCircle2, FileCheck, FileUp, Github, Info, Loader2, Plus, Send, Trash2, TriangleAlert, Upload, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { PageHero } from '@/components/PageHero';
import { pastPaperSubjects } from '@/content/curriculumData';
import { normalizeName, pastQuestionCollections } from '@/content/notes';
import { useLocation } from '@/content/router';
import './FeedbackView.css';
import './SendPaperView.css';

/** The largest PDF the server accepts (its requests are limited to 4.5 MB). */
const MAX_BYTES = 4 * 1024 * 1024;
/** Papers in one go (each is still sent, and reviewed, on its own). */
const MAX_PAPERS = 10;

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
const subjectOf = (folder: string) => pastPaperSubjects.find((s) => s.folder === folder);
const taken = (folder: string, y: string | number, t: string) => !!subjectOf(folder) && !!HAVE.get(normalizeName(folder))?.has(`${y}_${t}`);
const label = (name: string) => name.replace(/&/g, 'and');

type Term = '' | 'Spring' | 'Fall';
interface Paper {
  id: number;
  folder: string;
  year: string;
  term: Term;
  file: File | null;
  /** Why this one can't be sent (a bad file, or the server's answer). */
  error: string;
  sending?: boolean;
}
interface Sent {
  file: string;
  pullRequest?: string;
}

let nextId = 1;
const blank = (folder = ''): Paper => ({ id: nextId++, folder, year: '', term: '', file: null, error: '' });

/** A picked file, or why it can't be used. */
function check(file: File): string {
  if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) return 'Only PDF files can be sent. Scan the paper into one PDF first (any scanner app can).';
  if (file.size > MAX_BYTES) return `This PDF is ${mb(file.size)}. Please compress it under 4 MB (most scanner apps have a "compress" or "smaller size" option) and pick it again.`;
  return '';
}

const fileNameOf = (p: Paper) => {
  const s = subjectOf(p.folder);
  return s && p.year && p.term ? `${p.year}_${p.term}_${s.short}.pdf` : '';
};

/**
 * /send-paper: send Pokhara University past papers (PDFs) without GitHub. Each paper gets its own card
 * (subject, year, term and the file; "Add another paper" for more). Each is named for the collection
 * (`2024_Fall_DBMS.pdf`) and sent to api/send-paper.ts on its own, which opens a pull request for it,
 * so they're reviewed one by one. Nothing is published until it's merged.
 */
export function SendPaperView() {
  const { params } = useLocation();
  const preset = subjectOf(params.get('subject') ?? '')?.folder ?? '';
  const [papers, setPapers] = useState<Paper[]>(() => [blank(preset)]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<Sent[]>([]);
  /** Sent without a "received" email yet (the email goes with the last paper of a send). */
  const [unconfirmed, setUnconfirmed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const update = (id: number, change: Partial<Paper>) => setPapers((list) => list.map((p) => (p.id === id ? { ...p, ...change } : p)));
  const remove = (id: number) => setPapers((list) => (list.length > 1 ? list.filter((p) => p.id !== id) : list));
  const add = () => setPapers((list) => (list.length < MAX_PAPERS ? [...list, blank(list[list.length - 1]?.folder ?? '')] : list));

  /** Picking several PDFs at once fills this card and adds a card (same subject) for each of the others. */
  const pick = (id: number, chosen: FileList | null) => {
    const files = Array.from(chosen ?? []);
    setError('');
    if (!files.length) return;
    setPapers((list) => {
      const at = list.findIndex((p) => p.id === id);
      if (at < 0) return list;
      const room = MAX_PAPERS - list.length;
      const extra = files.slice(1, 1 + room).map((f) => ({ ...blank(list[at].folder), file: check(f) ? null : f, error: check(f) }));
      const first = files[0];
      const here = { ...list[at], file: check(first) ? null : first, error: check(first) };
      return [...list.slice(0, at), here, ...extra, ...list.slice(at + 1)];
    });
    if (files.length > 1 + MAX_PAPERS - papers.length) setError(`Up to ${MAX_PAPERS} papers at a time: send these, then the rest.`);
  };

  /** The problem that keeps a card from being sent, if any (shown on the card). */
  const problem = (p: Paper, i: number): { kind: 'have' | 'twice'; text: string } | null => {
    if (!p.folder || !p.year || !p.term) return null;
    const s = subjectOf(p.folder);
    if (taken(p.folder, p.year, p.term)) return { kind: 'have', text: `We already have the ${p.term} ${p.year} ${label(s?.name ?? p.folder)} paper. Thank you! Pick another year or term.` };
    if (papers.slice(0, i).some((q) => q.folder === p.folder && q.year === p.year && q.term === p.term)) {
      return { kind: 'twice', text: `You’ve added the ${p.term} ${p.year} ${label(s?.name ?? p.folder)} paper twice. Change this one or remove it.` };
    }
    return null;
  };

  const complete = (p: Paper) => !!(subjectOf(p.folder) && p.year && p.term && p.file);
  const ready = consent && !sending && papers.every((p, i) => complete(p) && !problem(p, i));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready) return;
    setSending(true);
    setError('');
    const trap = String(new FormData(e.currentTarget).get('website') ?? '');
    const queue = [...papers];
    const failed: Paper[] = [];
    const nowSent: Sent[] = [];
    let waiting = [...unconfirmed];

    for (const [i, p] of queue.entries()) {
      const subject = subjectOf(p.folder)!;
      const fileName = fileNameOf(p);
      update(p.id, { sending: true, error: '' });
      const body = new FormData();
      body.set('subject', subject.folder);
      body.set('short', subject.short);
      body.set('year', p.year);
      body.set('term', p.term);
      body.set('name', name.trim());
      body.set('college', college.trim());
      body.set('email', email.trim());
      // The subject's past questions page (same address as pastSubjectPath), linked in the "it's live" email.
      body.set('page', `/past-questions/semester-${subject.semester}/${subject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
      body.set('consent', 'yes');
      body.set('website', trap);
      // One "received" email for the whole send: it goes with the last paper and names the earlier ones.
      if (i < queue.length - 1) body.set('quiet', 'yes');
      else for (const w of waiting) body.append('other', w);
      body.append('file', p.file!, fileName);
      let message = '';
      try {
        const res = await fetch('/api/send-paper', { method: 'POST', body });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; files?: string[]; pullRequest?: string } | null;
        if (res.ok && data?.ok) {
          nowSent.push({ file: data.files?.[0] ?? fileName, pullRequest: data.pullRequest });
          if (i < queue.length - 1) waiting.push(`${subject.folder}|${subject.short}|${p.year}|${p.term}`);
          else waiting = [];
          update(p.id, { sending: false });
          continue;
        }
        message = data?.error ?? (res.status === 413 ? 'That’s too big: the PDF can be 4 MB at most.' : 'Couldn’t send this paper. Please try again.');
      } catch {
        message = 'Couldn’t reach the server. Check your connection and try again.';
      }
      failed.push({ ...p, sending: false, error: message });
    }

    setSent((list) => [...list, ...nowSent]);
    setUnconfirmed(waiting);
    setSending(false);
    if (!failed.length) {
      setDone(true);
      return;
    }
    // Keep only the ones that didn't go, with what went wrong on each.
    setPapers(failed);
    setError(nowSent.length
      ? `${nowSent.length} of ${queue.length} papers were sent. The ${failed.length === 1 ? 'one' : `${failed.length}`} below couldn’t be: see the message on ${failed.length === 1 ? 'it' : 'each'}.`
      : failed.length === 1 ? '' : 'None of the papers could be sent: see the message on each.');
  };

  const another = () => {
    setPapers([blank(papers[papers.length - 1]?.folder ?? '')]);
    setSent([]);
    setDone(false);
    setError('');
  };

  const many = papers.length > 1;
  const withPr = sent.filter((s) => s.pullRequest);

  return (
    <>
      <section className="semester-page-header content-page-header section-wrap pqi-header">
        <PageHero
          title={<>Send a <em>Past Paper</em></>}
          kicker="No GitHub needed"
          lead="Have Pokhara University exam papers? Send them here and they’re added to the collection after a quick check."
        />
      </section>

      <section className="section-wrap feedback-wrap">
        {done ? (
          <div className="feedback-card feedback-done" role="status">
            <CheckCircle2 size={40} />
            <h3>Thank you{name.trim() ? `, ${name.trim()}` : ''}!</h3>
            <p>
              {sent.length === 1 ? 'Your paper was sent as ' : `Your ${sent.length} papers were sent as `}
              <strong>{sent.map((s) => s.file).join(', ')}</strong>. {sent.length === 1 ? 'It goes' : 'Each goes'} live on the site once it’s been checked,
              usually within a few days.{email.trim() ? ' We’ve emailed you a confirmation, and we’ll email again when each paper is live.' : ''}
            </p>
            <div className="feedback-done-actions">
              <button type="button" className="feedback-secondary" onClick={another}>Send more papers</button>
              {withPr.length === 1 && (
                <a className="feedback-secondary" href={withPr[0].pullRequest} target="_blank" rel="noreferrer"><Github size={14} /> &nbsp;Follow it on GitHub</a>
              )}
              <Link to="/past-questions" className="feedback-secondary">Past questions</Link>
            </div>
            {withPr.length > 1 && (
              <p className="sendpaper-prs">
                <Github size={13} /> Follow them on GitHub:{' '}
                {withPr.map((s, i) => (
                  <span key={s.file}>{i > 0 && ' · '}<a href={s.pullRequest} target="_blank" rel="noreferrer">{s.file}</a></span>
                ))}
              </p>
            )}
          </div>
        ) : (
          <form className="feedback-card" onSubmit={submit}>
            <p className="feedback-intro">
              <FileUp size={18} />
              <span>
                <strong>Pokhara University exam papers</strong> only for now (not internal or college assessments), one PDF
                under 4 MB per paper. Have several? Add them all with <strong>Add another paper</strong>, or pick several PDFs
                at once. Each is named for the collection automatically and checked before it goes live. Prefer GitHub?
                See <Link to="/contributing#past-question-papers">the guide</Link>.
              </span>
            </p>

            {sent.length > 0 && (
              <p className="sendpaper-note is-ok" role="status">
                <CheckCircle2 size={15} /> Already sent: {sent.map((s) => s.file).join(', ')}.
              </p>
            )}

            <div className="sendpaper-papers">
              {papers.map((p, i) => {
                const subject = subjectOf(p.folder);
                const fileName = fileNameOf(p);
                const issue = problem(p, i);
                const box = (
                  <>
                    <label className="feedback-field">
                      <span>Subject</span>
                      <select value={p.folder} onChange={(e) => update(p.id, { folder: e.target.value })} required disabled={sending}>
                        <option value="" disabled>Choose the subject</option>
                        {pastPaperSubjects.map((s) => (
                          <option key={s.folder} value={s.folder}>{label(s.name)} ({s.short})</option>
                        ))}
                      </select>
                    </label>

                    <div className="sendpaper-row">
                      <label className="feedback-field">
                        <span>Year of the exam</span>
                        <select value={p.year} onChange={(e) => update(p.id, { year: e.target.value })} required disabled={sending}>
                          <option value="" disabled>Year (AD)</option>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}{taken(p.folder, y, 'Spring') && taken(p.folder, y, 'Fall') ? ' (both terms already here)' : ''}</option>
                          ))}
                        </select>
                      </label>
                      <fieldset className="feedback-field" disabled={sending}>
                        <legend>Term</legend>
                        <div className="sendpaper-terms">
                          {(['Spring', 'Fall'] as const).map((t) => {
                            const got = !!p.year && taken(p.folder, p.year, t);
                            return (
                              <label key={t} className={`sendpaper-term ${p.term === t ? 'is-active' : ''} ${got ? 'is-taken' : ''}`} title={got ? `We already have the ${t} ${p.year} paper` : undefined}>
                                <input type="radio" name={`term-${p.id}`} value={t} checked={p.term === t} onChange={() => update(p.id, { term: t })} />
                                <span>{t}</span>
                                {got && <small>Already here</small>}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    </div>

                    {issue && (
                      <p className="sendpaper-note" role="status"><Info size={15} /> {issue.text}</p>
                    )}

                    <div className="feedback-field">
                      <span>The paper (PDF)</span>
                      <label
                        className={`sendpaper-drop ${p.file ? 'has-file' : ''} ${dragging === p.id ? 'is-dragging' : ''} ${many ? 'is-compact' : ''}`}
                        onDragEnter={() => setDragging(p.id)}
                        onDragLeave={() => setDragging(null)}
                        onDrop={() => setDragging(null)}
                      >
                        {/* Covers the whole box, so a click or a dropped file lands on it. */}
                        <input type="file" accept=".pdf,application/pdf" multiple disabled={sending} onClick={(e) => { e.currentTarget.value = ''; }} onChange={(e) => pick(p.id, e.target.files)} />
                        <span className="sendpaper-drop-icon">{p.file ? <FileCheck size={22} /> : <Upload size={22} />}</span>
                        <strong>{p.file ? `${p.file.name} · ${mb(p.file.size)}` : 'Choose the PDF'}</strong>
                        <small>{p.file ? 'Click to choose a different file' : 'One PDF, under 4 MB. Click to browse, or drop it here.'}</small>
                        {p.file && !sending && (
                          <button type="button" className="sendpaper-clear" onClick={(e) => { e.preventDefault(); update(p.id, { file: null }); }} aria-label="Remove the file"><X size={15} /></button>
                        )}
                      </label>
                      {p.file && fileName && <small>Saved as <code>{fileName}</code> in <code>{subject?.folder}/</code></small>}
                    </div>

                    {p.error && <p className="feedback-error" role="alert"><TriangleAlert size={15} /> {p.error}</p>}
                  </>
                );
                if (!many) return <div key={p.id} className="sendpaper-single">{box}</div>;
                return (
                  <div key={p.id} className={`sendpaper-paper ${p.error ? 'has-error' : ''}`}>
                    <div className="sendpaper-paper-head">
                      <strong>Paper {i + 1}</strong>
                      {p.sending ? (
                        <span className="sendpaper-paper-state"><Loader2 size={13} className="spin" /> Sending…</span>
                      ) : fileName ? <code>{fileName}</code> : null}
                      {!sending && (
                        <button type="button" className="sendpaper-paper-remove" onClick={() => remove(p.id)} aria-label={`Remove paper ${i + 1}`} title="Remove this paper"><Trash2 size={15} /></button>
                      )}
                    </div>
                    {box}
                  </div>
                );
              })}
            </div>

            {papers.length < MAX_PAPERS && (
              <button type="button" className="sendpaper-add" onClick={add} disabled={sending}>
                <Plus size={16} /> Add another paper
              </button>
            )}

            <div className="sendpaper-row">
              <label className="feedback-field">
                <span>Your name <small>(optional, for credit)</small></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Leave empty to stay anonymous" autoComplete="name" />
              </label>
              <label className="feedback-field">
                <span>Your college <small>(optional)</small></span>
                <input type="text" value={college} onChange={(e) => setCollege(e.target.value.slice(0, 60))} placeholder="e.g. NCIT" autoComplete="organization" />
              </label>
            </div>

            <label className="feedback-field">
              <span>Email <small>(optional: we’ll tell you when it’s live)</small></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} placeholder="you@example.com" autoComplete="email" inputMode="email" />
              <small>Only used to email you that we got your papers, and when each one is live. Never shown or shared.</small>
            </label>

            <label className="sendpaper-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{many ? 'These are Pokhara University exam papers' : 'This is a Pokhara University exam paper'} that can be shared freely. If you add your name, it’s shown with the {many ? 'papers' : 'paper'} on GitHub.</span>
            </label>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="feedback-trap" aria-hidden="true" />

            {error && <p className="feedback-error" role="alert"><TriangleAlert size={15} /> {error}</p>}

            <button type="submit" className="feedback-submit" disabled={!ready}>
              {sending ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
              {sending ? 'Sending…' : many ? `Send ${papers.length} papers` : 'Send the paper'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
