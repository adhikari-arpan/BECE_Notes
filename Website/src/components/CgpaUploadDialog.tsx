import { useEffect, useRef, useState, type DragEvent } from 'react';
import { FileCheck2, FileUp, Loader2, Lock, PencilLine, Replace, ShieldAlert, TriangleAlert, X } from 'lucide-react';
import type { Entries } from '@/content/cgpa';
import { MODE_LABELS, type CgpaMode, type CustomData } from '@/content/cgpaCustom';

interface Loaded {
  entries: Entries;
  generated: Date | null;
  structure: CgpaMode;
  custom?: CustomData;
  semesters: number;
  batch: number | null;
}

interface Props {
  onClose: () => void;
  onLoaded: (report: Loaded) => void;
  /** The page already has grades, so loading a report would replace them. */
  hasExisting: boolean;
}

const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Drag-and-drop (or click) upload of a CGPA report downloaded from the calculator. */
export function CgpaUploadDialog({ onClose, onLoaded, hasExisting }: Props) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A report waiting for "replace what's on the page?" confirmation.
  const [pending, setPending] = useState<Loaded | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const read = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { readReport, ReportError } = await import('@/content/cgpaReport');
      try {
        const report = await readReport(file);
        if (hasExisting) setPending(report);
        else onLoaded(report);
      } catch (err) {
        setError(err instanceof ReportError ? err.message : 'Couldn’t read this PDF.');
      }
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void read(e.dataTransfer.files[0]);
  };

  const semesters = pending?.semesters ?? 0;

  return (
    <div className="cgpa-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cgpa-modal" role="dialog" aria-modal="true" aria-labelledby="cgpa-upload-title" tabIndex={-1} ref={dialog}>
        <button className="cgpa-modal-close" onClick={onClose} aria-label="Close"><X size={17} /></button>
        <h3 id="cgpa-upload-title">Upload your CGPA report</h3>
        <p className="cgpa-modal-sub">Carry on from a report you downloaded earlier: its grades fill in here, then add the semesters that are missing.</p>

        {pending ? (
          <div className="cgpa-confirm">
            <FileCheck2 size={30} />
            <strong>Report found: {semesters} {semesters === 1 ? 'semester' : 'semesters'}{pending.generated ? `, made on ${formatDate(pending.generated)}` : ''}</strong>
            <small className="cgpa-confirm-structure">Curriculum: {MODE_LABELS[pending.structure]}</small>
            <p>This will replace the grades currently on the page.</p>
            <div className="cgpa-confirm-actions">
              <button className="cgpa-action" onClick={() => setPending(null)}>Choose another</button>
              <button className="cgpa-action cgpa-action-primary" onClick={() => onLoaded(pending)}><Replace size={14} /> Replace and load</button>
            </div>
          </div>
        ) : (
          <button
            className={`cgpa-dropzone ${dragging ? 'is-dragging' : ''}`}
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            disabled={busy}
          >
            {busy ? <Loader2 size={30} className="spin" /> : <FileUp size={30} />}
            <strong>{busy ? 'Reading your report…' : dragging ? 'Drop it here' : 'Drag & drop your report here'}</strong>
            <span>or <u>click to choose a PDF</u></span>
            <small>BECE-Vault-CGPA-Report-….pdf · up to 5 MB</small>
          </button>
        )}
        <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { void read(e.target.files?.[0]); e.target.value = ''; }} />

        {error && <p className="cgpa-modal-error" role="alert"><TriangleAlert size={15} /> {error}</p>}

        <ul className="cgpa-modal-info">
          <li><FileCheck2 size={15} /><span><strong>Only reports from this calculator.</strong> Use a PDF saved with the <em>Download PDF</em> button. Other PDFs, marksheets and transcripts can't be read.</span></li>
          <li><PencilLine size={15} /><span><strong>Unedited files only.</strong> A report that was changed or re-saved in another app may be refused.</span></li>
          <li><Replace size={15} /><span><strong>Replaces what's on the page.</strong> Grades, typed SGPAs and electives load exactly as saved; you'll be asked first if you've already entered some.</span></li>
          <li><Lock size={15} /><span><strong>Stays on your device.</strong> The file is read in your browser and never uploaded to a server.</span></li>
          <li><ShieldAlert size={15} /><span><strong>Unofficial.</strong> Reports are estimates from what you entered, not valid for any official use.</span></li>
        </ul>
      </div>
    </div>
  );
}
