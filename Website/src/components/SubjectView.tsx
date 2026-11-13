import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  BookOpenText,
  ChevronDown,
  MousePointerClick,
  BookOpen,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ClipboardList,
  Code2,
  File,
  FileImage,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Monitor,
  FolderOpen,
  Presentation,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Link } from '@/components/Link';
import { BackArrow } from '@/components/PageHero';
import { ShareButton } from '@/components/ShareButton';
import { FileVote } from '@/components/FileVote';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PaperViewer, PastQuestionsView } from '@/components/PastQuestionsView';
import { navigate } from '@/content/router';
import { deviceStore } from '@/content/consent';
import { Loader } from '@/components/Loader';
import { useResizableSidebar } from '@/components/useResizableSidebar';
import { DownloadButton } from '@/components/DownloadButton';
import { formatSize, isSyllabusFolder, normalizeName, pastQuestionFolders, pastSubjectPath, plural, semesterPath, semesters, subjectPath, type FileKind, type NoteFile, type PastQuestionFolder, type Semester, type Subject } from '@/content/notes';
import { semester2025For } from '@/content/curriculum2025';
import { useStructure } from '@/content/structure';

/** Read or Browse, remembered across subjects. */
const VIEW_KEY = 'bece-notes:subject-view';

const PdfViewer = lazy(() => import('@/components/PdfViewer'));
const MarkdownViewer = lazy(() => import('@/components/MarkdownViewer'));

const kindLabels: Record<FileKind, string> = {
  pdf: 'PDF', doc: 'Word', slides: 'Slides', sheet: 'Sheet', image: 'Image', markdown: 'Markdown', code: 'Code', text: 'Text', other: 'File',
};

/** Microsoft's online Office viewer refuses files above these sizes. */
const OFFICE_PREVIEW_LIMIT = { doc: 10 * 1024 * 1024, slides: 10 * 1024 * 1024, sheet: 5 * 1024 * 1024 } as const;

/** Text-like files larger than this are offered as downloads instead of rendered inline. */
const MAX_INLINE_TEXT = 2 * 1024 * 1024;

function FileKindIcon({ kind, size = 18 }: { kind: FileKind; size?: number }) {
  if (kind === 'pdf' || kind === 'doc' || kind === 'text' || kind === 'markdown') return <FileText size={size} />;
  if (kind === 'slides') return <Presentation size={size} />;
  if (kind === 'sheet') return <FileSpreadsheet size={size} />;
  if (kind === 'image') return <FileImage size={size} />;
  if (kind === 'code') return <Code2 size={size} />;
  return <File size={size} />;
}

interface SubjectViewProps {
  semester: Semester;
  subject: Subject;
  /** File named in the URL (?file=…); defaults to the subject's first note. */
  requestedFile?: NoteFile;
}

/**
 * What a subject's top-level folder holds, from its name, so the file list can group and mark them:
 * the syllabus, notes (the default), lab works, assignments, question collections and extras.
 */
type FolderKind = 'syllabus' | 'notes' | 'lab' | 'assignment' | 'questions' | 'extra';
function folderKind(name: string): FolderKind {
  if (isSyllabusFolder(name)) return 'syllabus';
  if (/\blab/i.test(name)) return 'lab';
  if (/assignment/i.test(name)) return 'assignment';
  if (/question|qsn|past\s*paper/i.test(name)) return 'questions';
  if (/^_*extras?\b/i.test(name)) return 'extra';
  return 'notes';
}
/** A semester's past papers (/past-questions/semester-N), using the same file viewer as the notes. */
export function PastQuestionsPage(props: { semester: Semester; subject?: PastQuestionFolder; requestedFile?: NoteFile }) {
  return <PastQuestionsView {...props} renderPreview={(file) => <FilePreview key={file.id} file={file} />} />;
}

export function SubjectView({ semester, subject, requestedFile }: SubjectViewProps) {
  // The open file lives in the URL (?file=…) so it can be shared; it slides in over the overview.
  const activeFile = requestedFile;
  const openFile = (file: NoteFile) => navigate(subjectPath(semester, subject, file), { replace: true });
  const closeFile = () => navigate(subjectPath(semester, subject), { replace: true });
  // In the 2025 view, this subject "belongs" to its 2025 semester (e.g. Applied Physics → Semester I),
  // even though its notes are filed under the earlier one.
  const structure = useStructure();
  const sem2025 = structure === '2025' ? semester2025For(subject) : undefined;
  const homeSemester = (sem2025 && semesters.find((s) => s.id === String(sem2025.id))) || semester;
  // This subject's past papers, if it has any (filed under the semester its notes are in).
  const pastPapers = pastQuestionFolders(semester).find((f) => f.papers > 0 && normalizeName(f.name) === normalizeName(subject.name));
  // Previous / next in the viewer follow the overview's order.
  const order = useMemo(() => overviewOrder(subject), [subject]);
  const at = activeFile ? order.indexOf(activeFile) : -1;
  // Read (the default) or Browse; a student who picks Browse gets it on every subject.
  const [mode, setModeState] = useState<'read' | 'browse'>(() => (deviceStore.get(VIEW_KEY) === 'browse' ? 'browse' : 'read'));
  const setMode = (m: 'read' | 'browse') => {
    setModeState(m);
    deviceStore.set(VIEW_KEY, m);
  };
  const reading = !!activeFile || mode === 'read';
  // The file list beside the viewer: drag its edge to resize (remembered), drag it shut to hide it.
  const side = useResizableSidebar();

  return (
    <>
      <section className="subject-page">
        <div className="subject-topline">
          <BackArrow to={semesterPath(homeSemester)} label={homeSemester.label} inline />
          <Breadcrumbs items={[
            { label: 'Home', to: '/' },
            { label: 'Notes', to: '/notes' },
            { label: homeSemester.label, to: semesterPath(homeSemester) },
            activeFile ? { label: subject.name, to: subjectPath(semester, subject) } : { label: subject.name },
            ...(activeFile ? [{ label: activeFile.name.replace(/\.[a-z0-9]+$/i, '') }] : []),
          ]} />
          {/* Browse (everything, by unit) or Read (the viewer, with the file list beside it). */}
          {subject.files.length > 0 && (
            <div className="view-switch" role="group" aria-label="View">
              <button aria-pressed={!reading} onClick={() => { setMode('browse'); if (activeFile) closeFile(); }}><LayoutGrid size={14} /> Browse</button>
              <button aria-pressed={reading} onClick={() => setMode('read')}><BookOpen size={14} /> Read</button>
            </div>
          )}
          {/* The open file's controls, on this line rather than in a bar above the file. */}
          {activeFile && (
            <div className="topline-actions">
              <button className="icon-button" onClick={() => at > 0 && openFile(order[at - 1])} disabled={at <= 0} aria-label="Previous file" title="Previous file"><ChevronLeft size={16} /></button>
              <button className="icon-button" onClick={() => at < order.length - 1 && openFile(order[at + 1])} disabled={at < 0 || at >= order.length - 1} aria-label="Next file" title="Next file"><ChevronRight size={16} /></button>
              <DownloadButton file={activeFile} className="icon-button"><Download size={15} /></DownloadButton>
              <FileVote key={activeFile.path} path={activeFile.path} />
              <ShareButton title={`${activeFile.name.replace(/\.[a-z0-9]+$/i, '')} · ${subject.name} notes`} />
              <a className="icon-button" href={activeFile.url} target="_blank" rel="noreferrer" aria-label="Open in new tab" title="Open in new tab"><ExternalLink size={15} /></a>
            </div>
          )}
        </div>
        <div className="subject-box">
          {activeFile ? (
            <PaperViewer
              inline
              file={activeFile}
              prev={at > 0 ? order[at - 1] : undefined}
              next={at >= 0 && at < order.length - 1 ? order[at + 1] : undefined}
              onOpen={openFile}
              onClose={closeFile}
              renderPreview={(f) => <FilePreview key={f.id} file={f} />}
              sidebar={<ViewerFileList subject={subject} active={activeFile} onOpen={openFile} onOverview={() => { setMode('browse'); closeFile(); }} />}
              sidebarWidth={side.collapsed ? 0 : side.width}
              resizer={<div className="sidebar-resizer" {...side.handleProps} />}
            />
          ) : reading && subject.files.length > 0 ? (
            <div className="pastq-viewer is-inline has-side">
              <div className="pastq-viewer-main">
                <aside className="pastq-viewer-side" aria-label="Files in this subject" style={{ width: side.collapsed ? 0 : side.width }}>
                  <ViewerFileList subject={subject} onOpen={openFile} onOverview={() => setMode('browse')} />
                </aside>
                <div className="sidebar-resizer" {...side.handleProps} />
                <div className="pastq-viewer-body">
                  <div className="pick-file">
                    <div className="pick-file-icon"><MousePointerClick size={30} /></div>
                    <h3>Pick a file to start reading</h3>
                    <p>Choose any note from the list on the left and it opens right here, with search, zoom and the highlighter.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SubjectOverview semester={semester} homeSemester={homeSemester} subject={subject} pastPapers={pastPapers} />
          )}
        </div>
      </section>
    </>
  );
}

function FilePreview({ file }: { file: NoteFile }) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const isRemote = /^https?:/.test(file.url);

  let body: ReactNode;
  if (failed) {
    body = <Fallback file={file} title="Couldn't load a preview" message="The file can still be downloaded." />;
  } else if (file.kind === 'pdf') {
    body = (
      <Suspense fallback={<div className="pdf-loading"><Loader label="Loading viewer…" /></div>}>
        <PdfViewer url={file.url} fileName={file.name} fileKey={file.path} onError={onError} />
      </Suspense>
    );
  } else if (file.kind === 'image') {
    body = <div className="image-preview"><img src={file.url} alt={file.name} onError={onError} /></div>;
  } else if ((file.kind === 'markdown' || file.kind === 'code' || file.kind === 'text') && file.size <= MAX_INLINE_TEXT) {
    body = <TextPreview file={file} onError={onError} />;
  } else if ((file.kind === 'doc' || file.kind === 'slides' || file.kind === 'sheet') && file.size > OFFICE_PREVIEW_LIMIT[file.kind]) {
    body = <Fallback file={file} title="This file is too large to preview" message="Download it to view it on your device." />;
  } else if ((file.kind === 'doc' || file.kind === 'slides' || file.kind === 'sheet') && isRemote) {
    body = <iframe title={`Preview of ${file.name}`} src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`} />;
  } else if (file.kind === 'doc' || file.kind === 'slides' || file.kind === 'sheet') {
    body = <Fallback file={file} title="Office files preview on the live site" message="In local development, download the file to open it." />;
  } else {
    body = <Fallback file={file} title="No preview for this file type" message="Download the file to open it on your device." />;
  }

  return (
    <div className="preview-pane">
      <Logo className="content-watermark" />
      <div className={`preview-content ${file.kind === 'pdf' && !failed ? 'preview-content-pdf' : ''}`}>{body}</div>
    </div>
  );
}

function TextPreview({ file, onError }: { file: NoteFile; onError: () => void }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(file.url)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(res.statusText))))
      .then((t) => !cancelled && setText(t))
      .catch(() => !cancelled && onError());
    return () => {
      cancelled = true;
    };
  }, [file.url, onError]);

  if (text === null) return <div className="pdf-loading"><Loader /></div>;

  if (file.kind === 'markdown') {
    return (
      <Suspense fallback={<div className="pdf-loading"><Loader /></div>}>
        <MarkdownViewer source={text} url={file.url} title={file.name} />
      </Suspense>
    );
  }
  return <pre className="code-preview">{file.name.endsWith('.ipynb') ? notebookSource(text) : text}</pre>;
}

/** Flattens a Jupyter notebook into its cell sources so it reads like a script. */
function notebookSource(json: string): string {
  try {
    const nb = JSON.parse(json) as { cells?: { cell_type: string; source: string | string[] }[] };
    return (nb.cells ?? [])
      .map((cell) => {
        const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        return cell.cell_type === 'markdown' ? src.split('\n').map((l) => `# ${l}`).join('\n') : src;
      })
      .join('\n\n');
  } catch {
    return json;
  }
}

function Fallback({ file, title, message }: { file: NoteFile; title: string; message: string }) {
  return (
    <div className="unsupported-preview">
      <div className="large-file-icon"><FileKindIcon kind={file.kind} size={28} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      <DownloadButton file={file} className="download-button">
        <ArrowDownToLine size={17} /> Download {kindLabels[file.kind]}
      </DownloadButton>
    </div>
  );
}

/* ------------------------- Subject overview ------------------------- */

/** "Unit 3_Structured Query Language", "Chapter1_Overview", "Ch 2" → 3, 1, 2 (the first numbered folder in the path). */
function unitNumber(folder: string): number | null {
  for (const part of folder.split('/')) {
    const m = /^(?:unit|chapter|ch|module)[\s_.-]*(\d+)/i.exec(part);
    if (m) return Number(m[1]);
  }
  return null;
}
/** The name after the number in a unit folder: "Unit 3_Structured Query Language" → "Structured Query Language". */
function unitFolderName(folder: string): string {
  const part = folder.split('/').find((p) => /^(?:unit|chapter|ch|module)[\s_.-]*\d+/i.test(p)) ?? '';
  return part.replace(/^(?:unit|chapter|ch|module)[\s_.-]*\d+[\s_.:-]*/i, '').replace(/_+/g, ' ').trim();
}

const OVERVIEW_GROUPS: { kind: FolderKind; label: string; icon: LucideIcon }[] = [
  { kind: 'lab', label: 'Lab works', icon: Monitor },
  { kind: 'assignment', label: 'Assignments', icon: ClipboardList },
  { kind: 'questions', label: 'Question collections', icon: FileQuestion },
  { kind: 'extra', label: 'Extra notes', icon: Sparkles },
];

/**
 * What a subject page shows before a file is picked: its files grouped the way students look for
 * them (syllabus, units of the PU syllabus, complete notes, lab works…), every file a real link.
 * Collapsed sections keep their links on the page, so search engines see all of them.
 */
/** A subject's files the way the overview groups them: syllabus, units, other notes, lab works… */
function groupSubject(subject: Subject) {
  const kindOf = (f: NoteFile): FolderKind => (f.folder ? folderKind(f.folder.split('/')[0]) : 'notes');
  const syllabus = subject.files.filter((f) => kindOf(f) === 'syllabus');
  const byUnit = new Map<number, NoteFile[]>();
  const general: NoteFile[] = [];
  for (const f of subject.files.filter((x) => kindOf(x) === 'notes')) {
    const n = unitNumber(f.folder);
    if (n === null) general.push(f);
    else byUnit.set(n, [...(byUnit.get(n) ?? []), f]);
  }
  // Units from the PU syllabus, plus any numbered folder beyond them (named after the folder).
  const unitNames = new Map<number, string>((subject.units ?? []).map(([name], i) => [i + 1, name]));
  for (const [n, files] of byUnit) if (!unitNames.has(n)) unitNames.set(n, unitFolderName(files[0].folder) || `Unit ${n}`);
  const units = [...unitNames.entries()].sort((x, y) => x[0] - y[0]).map(([n, name]) => ({ n, name, hours: subject.units?.[n - 1]?.[1], files: byUnit.get(n) ?? [] }));
  const groups = OVERVIEW_GROUPS.map((g) => ({ ...g, files: subject.files.filter((f) => kindOf(f) === g.kind) })).filter((g) => g.files.length);
  return { syllabus, units, general, groups };
}
const overviewOrder = (subject: Subject) => {
  const g = groupSubject(subject);
  return [...g.syllabus, ...g.units.flatMap((u) => u.files), ...g.general, ...g.groups.flatMap((x) => x.files)];
};

function SubjectOverview({ semester, homeSemester, subject, pastPapers }: { semester: Semester; homeSemester: Semester; subject: Subject; pastPapers?: PastQuestionFolder }) {
  const { syllabus, units, general, groups } = groupSubject(subject);
  const fileLink = (f: NoteFile, base = '') => (
    <li key={f.id}>
      <Link to={subjectPath(semester, subject, f)} className="ov-file" title={f.path}>
        <span className={`file-badge ${f.kind}`}><FileKindIcon kind={f.kind} size={13} /></span>
        <span className="ov-file-text">
          <strong>{f.name.replace(/\.[a-z0-9]+$/i, '')}</strong>
          <small>{[f.folder && f.folder !== base ? f.folder.replace(base ? `${base}/` : '', '').replace(/^_+/, '') : '', kindLabels[f.kind], formatSize(f.size)].filter(Boolean).join(' · ')}</small>
        </span>
      </Link>
    </li>
  );

  return (
    <div className="subject-overview">
      <div className="ov-inner">
        <header className="ov-head">
          <div className="ov-title">
            <h2>{subject.name}</h2>
            <span className="ov-meta">
              {[subject.kind === 'course' && !/^ELEC\b/.test(subject.code) ? subject.code : '', homeSemester.label, subject.credits !== null ? plural(subject.credits, 'credit') : ''].filter(Boolean).join(' · ')}
            </span>
          </div>
          <ShareButton title={`${subject.name} notes`} />
        </header>
        <div className="ov-layout">
        <nav className="ov-chips" aria-label="In this subject">
          {syllabus[0] && <Link to={subjectPath(semester, subject, syllabus[0])} className="ov-chip ov-chip-syllabus"><ScrollText size={14} /> Syllabus</Link>}
          {general.length > 0 && <a href="#ov-notes" className="ov-chip"><BookOpenText size={14} /> Complete notes <b>{general.length}</b></a>}
          {groups.map((g) => <a key={g.kind} href={`#ov-${g.kind}`} className="ov-chip"><g.icon size={14} /> {g.label} <b>{g.files.length}</b></a>)}
          {pastPapers && <Link to={pastSubjectPath(semester, pastPapers.name)} className="ov-chip ov-chip-papers"><FileQuestion size={14} /> Past papers <b>{pastPapers.papers}</b></Link>}
        </nav>
        <div className="ov-main">

        {units.length > 0 && (
          <section className="ov-section" aria-labelledby="ov-units-title">
            <h3 id="ov-units-title">Units <small>from the Pokhara University syllabus</small></h3>
            <ol className="ov-units">
              {units.map(({ n, name, hours, files }) => {
                const head = (
                  <>
                    <span className="ov-unit-no">{String(n).padStart(2, '0')}</span>
                    <span className="ov-unit-name">{name}</span>
                    {hours ? <small className="ov-unit-hrs">{hours} hrs</small> : null}
                    {!files.length && <span className="ov-unit-count is-empty">No files yet</span>}
                  </>
                );
                return (
                  <li key={n}>
                    {files.length ? (
                      <details className="ov-unit" open>
                        <summary>{head}<ChevronDown size={15} className="ov-chevron" /></summary>
                        <ul className="ov-files">{files.map((f) => fileLink(f, f.folder.split('/')[0]))}</ul>
                      </details>
                    ) : (
                      <div className="ov-unit ov-unit-empty">{head}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {general.length > 0 && (
          <section className="ov-section" id="ov-notes" aria-labelledby="ov-notes-title">
            <h3 id="ov-notes-title">{units.length ? 'Complete and other notes' : 'Notes'}</h3>
            <ul className="ov-files ov-files-grid">{general.map((f) => fileLink(f))}</ul>
          </section>
        )}

        {groups.map((g) => (
          <section key={g.kind} className={`ov-section tree-group-${g.kind}`} id={`ov-${g.kind}`} aria-labelledby={`ov-${g.kind}-title`}>
            <details className="ov-group" open={g.files.length <= 6}>
              <summary><h3 id={`ov-${g.kind}-title`}><g.icon size={16} /> {g.label} <small>{plural(g.files.length, 'file')}</small></h3><ChevronDown size={15} className="ov-chevron" /></summary>
              <ul className="ov-files ov-files-grid">{g.files.map((f) => fileLink(f, f.folder.split('/')[0]))}</ul>
            </details>
          </section>
        ))}

        {subject.files.length === 0 && (
          <div className="ov-empty">
            <FolderOpen size={24} />
            <p><strong>No notes here yet.</strong> Have notes for {subject.name}? Share them so the next batch can study from them too.</p>
            <Link to="/contributing" className="download-button">How to contribute</Link>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}

/** The subject's files beside the open one, grouped like the overview, for switching without closing. */
function ViewerFileList({ subject, active, onOpen, onOverview }: { subject: Subject; active?: NoteFile; onOpen: (f: NoteFile) => void; onOverview: () => void }) {
  const { syllabus, units, general, groups } = groupSubject(subject);
  const sections: { key: string; label: string; files: NoteFile[] }[] = [
    { key: 'syllabus', label: 'Syllabus', files: syllabus },
    ...units.filter((u) => u.files.length).map((u) => ({ key: `u${u.n}`, label: `${String(u.n).padStart(2, '0')} · ${u.name}`, files: u.files })),
    { key: 'notes', label: units.length ? 'Complete and other notes' : 'Notes', files: general },
    ...groups.map((g) => ({ key: g.kind, label: g.label, files: g.files })),
  ].filter((x) => x.files.length);
  // Keep the open file in view when it changes.
  useEffect(() => {
    document.querySelector('.viewer-files .is-active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  return (
    <nav className="viewer-files">
      <button className="viewer-files-home" onClick={onOverview} title="Back to all files, by unit">
        <span className="viewer-files-logo"><Logo /></span>
        <span><strong>BECE Vault</strong><small>All {subject.name} files</small></span>
      </button>
      {sections.map((sec) => (
        <div key={sec.key} className="viewer-files-group">
          <span className="viewer-files-label">{sec.label}</span>
          {sec.files.map((f) => (
            <button key={f.id} className={f.id === active?.id ? 'is-active' : ''} onClick={() => onOpen(f)} title={f.name} aria-current={f.id === active?.id ? 'true' : undefined}>
              <span className={`file-badge ${f.kind}`}><FileKindIcon kind={f.kind} size={12} /></span>
              <span className="viewer-files-name">{f.name.replace(/\.[a-z0-9]+$/i, '')}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

