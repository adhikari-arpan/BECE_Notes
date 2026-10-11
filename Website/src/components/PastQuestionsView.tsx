import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, FolderOpen, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { DownloadButton } from '@/components/DownloadButton';
import { PastQuestionsGuide } from '@/components/PastQuestionsGuide';
import { navigate } from '@/content/router';
import { formatSize, pastQuestionsFor, pastQuestionsPath, plural, semesterPath, type NoteFile, type Semester } from '@/content/notes';
import { pastQuestionSubjects } from '@/content/pastQuestions';
import { STRUCTURE_LABELS, useStructure } from '@/content/structure';
import './PastQuestionsView.css';

interface Props {
  semester: Semester;
  /** The paper open in the viewer (from ?file=…), if any. */
  requestedFile?: NoteFile;
  /** The note viewer used on subject pages, shown inside the slide-in panel. */
  renderPreview: (file: NoteFile) => ReactNode;
}

interface Section {
  key: string;
  title: string;
  short?: string | null;
  /** In the 2025 view: the semester whose folder holds these papers, when it isn't this one. */
  filedIn?: string;
  papers: NoteFile[];
  /** Assessment collections: papers shown under one heading per year. */
  byYear?: boolean;
}

/** "2024_College_Assessments" → "College Assessments" (the year becomes a group inside the section). */
const withoutYear = (folder: string) => folder.replace(/(?:^|[_\s-])(?:19|20)\d{2}(?=[_\s-]|$)/g, ' ').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Papers grouped by year, newest first; papers without a year last. */
function yearGroups(papers: NoteFile[]) {
  const groups = new Map<string, NoteFile[]>();
  for (const f of papers) groups.set(yearOf(f) ?? 'Other', [...(groups.get(yearOf(f) ?? 'Other') ?? []), f]);
  return [...groups.entries()].sort(([a], [b]) => (a === 'Other' ? 1 : b === 'Other' ? -1 : Number(b) - Number(a)));
}

/** Exam year from the file or its folder: `2024_Spring_AG.pdf`, `2024_College_Assessments/…`, `… 2081 …`. */
const yearOf = (f: NoteFile) => /(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/.exec(`${f.folder}/${f.name}`)?.[1] ?? null;
const termOf = (f: NoteFile) => (/spring/i.test(f.name) ? 'Spring' : /fall/i.test(f.name) ? 'Fall' : null);
const isAssessment = (f: NoteFile) => /assessment|internal|term[-\s]?test/i.test(`${f.folder}/${f.name}`);
const baseName = (f: NoteFile) => f.name.replace(/\.[^.]+$/, '');

/**
 * "2024_Spring_AG.pdf" → "Spring 2024 exam"; anything after the short form is kept, so
 * "2024_Spring_TOC_Old.pdf" → "Spring 2024 exam (Old)" and "…_AG_2.jpg" → "Spring 2024 exam (2)".
 * Anything else → its name, tidied.
 */
function titleOf(f: NoteFile) {
  const m = /^(\d{4})_(Spring|Fall)_[^_.]+(?:_([^.]+))?\./i.exec(f.name);
  if (m) return `${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()} ${m[1]} exam${m[3] ? ` (${m[3].replace(/_+/g, ' ')})` : ''}`;
  return baseName(f).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Newest first; Fall after Spring in the same year. */
const newestFirst = (a: NoteFile, b: NoteFile) =>
  Number(yearOf(b) ?? 0) - Number(yearOf(a) ?? 0) || (termOf(b) === 'Fall' ? 1 : 0) - (termOf(a) === 'Fall' ? 1 : 0) || a.name.localeCompare(b.name, undefined, { numeric: true });

/**
 * A semester's Past Question Collection: every paper on one page, grouped by subject (in curriculum
 * order), with year and term tags and a year filter. Opening a paper slides a viewer in from the right;
 * closing it returns to the list. Folders like `2024_College_Assessments` come last. Follows the
 * curriculum switch: in the 2025 view it lists that semester's 2025 subjects, wherever their papers are filed.
 */
export function PastQuestionsView({ semester, requestedFile, renderPreview }: Props) {
  const collectionFiles = useMemo(() => pastQuestionsFor(semester)?.files ?? [], [semester]);
  const structure = useStructure();
  const subjects = useMemo(() => pastQuestionSubjects(semester, structure), [semester, structure]);
  const [year, setYear] = useState<string | null>(null);

  const sections = useMemo(() => {
    const bySubject: Section[] = subjects.map((s) => ({
      key: `${s.home.id}:${s.folder}`,
      title: s.folder,
      short: s.short,
      filedIn: s.home !== semester ? s.home.label : undefined,
      papers: s.files,
    }));
    const matched = new Set(subjects.flatMap((s) => s.files));
    const other = new Map<string, Section>();
    const loose: NoteFile[] = [];
    // This semester's other folders and loose files. They follow the before-2025 order, so the 2025 view leaves them out.
    for (const file of structure === 'pre2025' ? collectionFiles : []) {
      const top = file.folder.split('/')[0];
      if (matched.has(file)) continue;
      if (!top) loose.push(file);
      else {
        // 2024_College_Assessments and 2025_College_Assessments form one "College Assessments" section.
        const assessment = /assessment/i.test(top);
        const title = assessment ? withoutYear(top).replace(/assessment\b/i, 'Assessments') : top.replace(/_+/g, ' ');
        const key = assessment ? `assess:${title.toLowerCase()}` : top;
        const s = other.get(key) ?? { key, title, papers: [], byYear: assessment };
        s.papers.push(file);
        other.set(key, s);
      }
    }
    const extra = [...other.values()];
    const all: Section[] = [
      ...bySubject,
      ...extra.filter((s) => !s.byYear),
      ...(loose.length ? [{ key: '__all', title: 'All subjects', papers: loose }] : []),
      // Assessment collections at the end.
      ...extra.filter((s) => s.byYear),
    ];
    return all.map((s) => ({ ...s, papers: [...s.papers].sort(newestFirst) })).filter((s) => s.papers.length);
  }, [subjects, semester, structure, collectionFiles]);

  const allPapers = sections.flatMap((s) => s.papers);
  const years = [...new Set(allPapers.map(yearOf).filter((y): y is string => !!y))].sort((a, b) => Number(b) - Number(a));
  const shown = sections.map((s) => ({ ...s, papers: year ? s.papers.filter((f) => yearOf(f) === year) : s.papers })).filter((s) => s.papers.length);
  const order = shown.flatMap((s) => (s.byYear ? yearGroups(s.papers).flatMap(([, papers]) => papers) : s.papers));

  const paperRow = (f: NoteFile, inYearGroup: boolean) => {
    const y = yearOf(f);
    const t = termOf(f);
    return (
      <li key={f.id}>
        <button className={`pastq-paper ${current?.id === f.id ? 'is-open' : ''}`} onClick={() => open(f)}>
          <span className="pastq-tags">
            {y && !inYearGroup && <span className="pastq-tag pastq-tag-year">{y}</span>}
            {t && <span className={`pastq-tag pastq-tag-${t.toLowerCase()}`}>{t}</span>}
            {!inYearGroup && isAssessment(f) && <span className="pastq-tag">Assessment</span>}
          </span>
          <span className="pastq-paper-name">
            <strong>{titleOf(f)}</strong>
            <small>{f.name} · {formatSize(f.size)}</small>
          </span>
          <FileText size={16} className="pastq-paper-icon" />
        </button>
      </li>
    );
  };

  // Papers from this semester's folder open with a shareable ?file= link; in the 2025 view, papers
  // filed under another semester open in place.
  const [elsewhere, setElsewhere] = useState<NoteFile>();
  const current = elsewhere ?? requestedFile;
  const open = (file: NoteFile) => {
    if (collectionFiles.includes(file)) {
      setElsewhere(undefined);
      navigate(pastQuestionsPath(semester, file), { replace: !!requestedFile });
    } else setElsewhere(file);
  };
  const close = () => {
    if (elsewhere) setElsewhere(undefined);
    else navigate(pastQuestionsPath(semester), { replace: true });
  };

  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to={pastQuestionsPath()} className="back-button"><ArrowLeft size={16} /> All semesters</Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">{semester.label} · {STRUCTURE_LABELS[structure]} · Pokhara University exam papers</span>
            <h2>{semester.label} Past Questions</h2>
          </div>
          <span className="subject-count-pill">{plural(allPapers.length, 'paper')}</span>
        </div>
      </section>

      <section className="section-wrap pastq-page">
        {years.length > 1 && (
          <div className="pastq-years" role="group" aria-label="Filter by year">
            <button className={!year ? 'is-active' : ''} onClick={() => setYear(null)} aria-pressed={!year}>All years</button>
            {years.map((y) => (
              <button key={y} className={year === y ? 'is-active' : ''} onClick={() => setYear(year === y ? null : y)} aria-pressed={year === y}>{y}</button>
            ))}
          </div>
        )}

        {shown.length ? (
          shown.map((s) => (
            <div key={s.key} className="pastq-section">
              <h3>
                {s.title}
                {s.short && <span className="pastq-short">{s.short}</span>}
                {s.filedIn && <span className="pastq-filed">filed in {s.filedIn}</span>}
                <small>{plural(s.papers.length, 'paper')}</small>
              </h3>
              {s.byYear ? (
                yearGroups(s.papers).map(([y, papers]) => (
                  <div key={y} className="pastq-year-group">
                    <h4>{y}<small>{plural(papers.length, 'paper')}</small></h4>
                    <ul className="pastq-papers">{papers.map((f) => paperRow(f, true))}</ul>
                  </div>
                ))
              ) : (
                <ul className="pastq-papers">{s.papers.map((f) => paperRow(f, false))}</ul>
              )}
            </div>
          ))
        ) : (
          <div className="pastq-none">
            <FolderOpen size={26} />
            <p>No papers here yet. Be the first to add one.</p>
          </div>
        )}

        <p className="pastq-notes-link"><Link to={semesterPath(semester)}>Looking for notes? Go to {semester.label} notes <ArrowRight size={14} /></Link></p>

        <div className="pastq-help"><PastQuestionsGuide semester={semester} subjects={subjects} /></div>
      </section>

      {current && (
        <PaperViewer
          key={current.id}
          file={current}
          prev={order[order.indexOf(current) - 1]}
          next={order[order.indexOf(current) + 1]}
          onOpen={open}
          onClose={close}
          renderPreview={renderPreview}
        />
      )}
    </>
  );
}

/** One paper in a panel that slides in from the right, with close, previous/next and download. */
function PaperViewer({ file, prev, next, onOpen, onClose, renderPreview }: {
  file: NoteFile;
  prev?: NoteFile;
  next?: NoteFile;
  onOpen: (file: NoteFile) => void;
  onClose: () => void;
  renderPreview: (file: NoteFile) => ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const close = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  // Esc closes; the page behind doesn't scroll while the panel is open.
  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const y = yearOf(file);
  const t = termOf(file);

  return (
    <div className={`pastq-viewer-backdrop ${closing ? 'is-closing' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="pastq-viewer" role="dialog" aria-modal="true" aria-label={titleOf(file)} tabIndex={-1} ref={panel}>
        <header className="pastq-viewer-head">
          <button className="icon-button" onClick={close} aria-label="Close and go back to the list" title="Close (Esc)"><X size={16} /></button>
          <div className="pastq-viewer-title">
            <span className="pastq-tags">
              {y && <span className="pastq-tag pastq-tag-year">{y}</span>}
              {t && <span className={`pastq-tag pastq-tag-${t.toLowerCase()}`}>{t}</span>}
            </span>
            <strong title={file.path}>{titleOf(file)}</strong>
            <small>{file.folder ? `${file.folder.replace(/_+/g, ' ')} · ` : ''}{formatSize(file.size)}</small>
          </div>
          <div className="pastq-viewer-actions">
            <button className="icon-button" onClick={() => prev && onOpen(prev)} disabled={!prev} aria-label="Previous paper" title="Previous paper"><ChevronLeft size={16} /></button>
            <button className="icon-button" onClick={() => next && onOpen(next)} disabled={!next} aria-label="Next paper" title="Next paper"><ChevronRight size={16} /></button>
            <DownloadButton file={file} className="icon-button"><Download size={15} /></DownloadButton>
            <a className="icon-button" href={file.url} target="_blank" rel="noreferrer" aria-label="Open in new tab" title="Open in new tab"><ExternalLink size={15} /></a>
          </div>
        </header>
        <div className="pastq-viewer-body">{renderPreview(file)}</div>
      </div>
    </div>
  );
}
