import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, FileUp, Github, Loader2, Send, TriangleAlert, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { PageHero } from '@/components/PageHero';
import { pastPaperSubjects } from '@/content/curriculumData';
import { useLocation } from '@/content/router';
import './FeedbackView.css';
import './SendPaperView.css';

/** Room for the files in one request (the server accepts 4 MB in total). */
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_PHOTOS = 8;
/** Photos are made smaller on the phone before sending: at most this many pixels on the long side, about 1 MB each. */
const PHOTO_EDGE = 2200;
const PHOTO_TARGET = 1024 * 1024;

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 2009 }, (_, i) => thisYear - i);

const mb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** A photo of a page as a JPEG small enough to send (upright, up to PHOTO_EDGE pixels, about 1 MB). */
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.62, 0.52]) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= PHOTO_TARGET) break;
  }
  if (!blob) throw new Error('jpeg');
  return blob;
}

interface Picked {
  /** What gets sent: the PDF as it is, or each photo made smaller. */
  blobs: Blob[];
  kind: 'pdf' | 'jpg';
  label: string;
}

/**
 * /send-paper: send a Pokhara University past paper without GitHub. Pick the subject, the exam (year
 * and term) and the file; it's named for the collection (`2024_Fall_DBMS.pdf`) and sent to
 * api/send-paper.ts, which opens a pull request for review. Nothing is published until it's merged.
 */
export function SendPaperView() {
  const { params } = useLocation();
  const preset = params.get('subject');
  const [folder, setFolder] = useState(() => pastPaperSubjects.find((s) => s.folder === preset)?.folder ?? '');
  const [year, setYear] = useState('');
  const [term, setTerm] = useState<'' | 'Spring' | 'Fall'>('');
  const [picked, setPicked] = useState<Picked | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ files: string[]; pullRequest?: string } | null>(null);

  const subject = pastPaperSubjects.find((s) => s.folder === folder);
  const base = subject && year && term ? `${year}_${term}_${subject.short}` : '';
  const fileNames = useMemo(() => {
    if (!base || !picked) return [];
    return picked.blobs.length === 1 ? [`${base}.${picked.kind}`] : picked.blobs.map((_, i) => `${base}_${i + 1}.${picked.kind}`);
  }, [base, picked]);

  const fail = (message: string) => {
    setError(message);
    setStatus('error');
  };

  const pick = async (list: FileList | null) => {
    const files = [...(list ?? [])];
    setPicked(null);
    setError('');
    setStatus('idle');
    if (!files.length) return;
    const pdfs = files.filter((f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name));
    const photos = files.filter((f) => /^image\/(jpeg|png)$/.test(f.type) || /\.(jpe?g|png)$/i.test(f.name));
    if (pdfs.length + photos.length !== files.length) return fail('Only PDF, JPG and PNG files can be sent.');
    if (pdfs.length && photos.length) return fail('Send one PDF, or photos of the pages, but not both.');
    if (pdfs.length > 1) return fail('One PDF per paper, please.');
    if (photos.length > MAX_PHOTOS) return fail(`Up to ${MAX_PHOTOS} photos per paper. Combine them into one PDF if there are more pages.`);
    if (pdfs.length) {
      if (pdfs[0].size > MAX_BYTES) {
        return fail(`This PDF is ${mb(pdfs[0].size)}. Please compress it under 4 MB (most scanner apps have a "compress" or "smaller size" option) and pick it again.`);
      }
      setPicked({ blobs: [pdfs[0]], kind: 'pdf', label: `${pdfs[0].name} · ${mb(pdfs[0].size)}` });
      return;
    }
    setPreparing(true);
    try {
      const blobs = [];
      for (const photo of photos) blobs.push(await shrinkPhoto(photo));
      const total = blobs.reduce((n, b) => n + b.size, 0);
      if (total > MAX_BYTES) return fail(`Those photos are ${mb(total)} together, over the 4 MB limit. Send fewer pages at a time, or one PDF.`);
      setPicked({ blobs, kind: 'jpg', label: `${photos.length} photo${photos.length > 1 ? 's' : ''} · ${mb(total)} after shrinking` });
    } catch {
      fail('Couldn’t read those photos. Try JPG or PNG files, or one PDF.');
    } finally {
      setPreparing(false);
    }
  };

  const ready = !!(subject && year && term && picked && consent) && status !== 'sending' && !preparing;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready || !subject || !picked) return;
    setStatus('sending');
    setError('');
    const body = new FormData();
    body.set('subject', subject.folder);
    body.set('short', subject.short);
    body.set('year', year);
    body.set('term', term);
    body.set('name', name.trim());
    body.set('college', college.trim());
    body.set('consent', 'yes');
    body.set('website', String(new FormData(e.currentTarget).get('website') ?? ''));
    picked.blobs.forEach((blob, i) => body.append('file', blob, fileNames[i]));
    try {
      const res = await fetch('/api/send-paper', { method: 'POST', body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; files?: string[]; pullRequest?: string } | null;
      if (res.ok && data?.ok) {
        setResult({ files: data.files ?? fileNames, pullRequest: data.pullRequest });
        setStatus('sent');
        return;
      }
      fail(data?.error ?? (res.status === 413 ? 'That’s too big: the files can be 4 MB in total.' : 'Couldn’t send the paper. Please try again.'));
    } catch {
      fail('Couldn’t reach the server. Check your connection and try again.');
    }
  };

  const another = () => {
    setYear('');
    setTerm('');
    setPicked(null);
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
              usually within a few days.
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
                One paper at a time: a PDF (under 4 MB), or photos of its pages. It’s named for the collection automatically and
                checked before it goes live. Prefer GitHub? See <Link to="/contributing#past-question-papers">the guide</Link>.
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
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <fieldset className="feedback-field">
                <legend>Term</legend>
                <div className="feedback-topics">
                  {(['Spring', 'Fall'] as const).map((t) => (
                    <label key={t} className={`feedback-topic ${term === t ? 'is-active' : ''}`}>
                      <input type="radio" name="term" value={t} checked={term === t} onChange={() => setTerm(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="feedback-field">
              <span>The paper</span>
              <label className={`sendpaper-drop ${picked ? 'has-file' : ''}`}>
                <input type="file" accept=".pdf,application/pdf,.jpg,.jpeg,.png,image/jpeg,image/png" multiple onClick={(e) => { e.currentTarget.value = ''; }} onChange={(e) => void pick(e.target.files)} />
                {preparing ? <Loader2 size={18} className="spin" /> : <FileUp size={18} />}
                <span>{preparing ? 'Preparing photos…' : picked ? picked.label : 'Choose a PDF, or photos of the pages'}</span>
                {picked && (
                  <button type="button" className="sendpaper-clear" onClick={(e) => { e.preventDefault(); setPicked(null); }} aria-label="Remove the file"><X size={14} /></button>
                )}
              </label>
              {fileNames.length > 0 && <small>Saved as <code>{fileNames.join(', ')}</code> in <code>{subject?.folder}/</code></small>}
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

            <label className="sendpaper-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>This is a Pokhara University exam paper (or a college assessment) that can be shared freely. If you add your name, it’s shown with the paper on GitHub.</span>
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
