import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  BookOpenText,
  Info,
  MousePointerClick,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Code2,
  Download,
  ExternalLink,
  File,
  FileImage,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Monitor,
  Folder,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Link } from '@/components/Link';
import { BackArrow } from '@/components/PageHero';
import { ShareButton } from '@/components/ShareButton';
import { syllabusPath } from '@/content/curriculum2025';
import { PastQuestionsView } from '@/components/PastQuestionsView';
import { navigate } from '@/content/router';
import { Loader } from '@/components/Loader';
import { DownloadButton } from '@/components/DownloadButton';
import { useResizableSidebar } from '@/components/useResizableSidebar';
import { formatDate, formatSize, isSyllabusFolder, normalizeName, pastQuestionFolders, pastSubjectPath, plural, semesterPath, semesters, subjectPath, type FileKind, type NoteFile, type PastQuestionFolder, type Semester, type Subject } from '@/content/notes';
import { semester2025For } from '@/content/curriculum2025';
import { useStructure } from '@/content/structure';

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

/** A folder in the subject's file list, holding its own files and subfolders. */
interface TreeFolder {
  name: string;
  /** Path relative to the subject folder, e.g. `NAST College Notes/Unit 1`. */
  path: string;
  files: NoteFile[];
  folders: TreeFolder[];
  /** Files in this folder and every folder inside it. */
  total: number;
}

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

function buildTree(files: NoteFile[]): TreeFolder {
  const root: TreeFolder = { name: '', path: '', files: [], folders: [], total: 0 };
  for (const file of files) {
    let node = root;
    node.total++;
    for (const part of file.folder ? file.folder.split('/') : []) {
      const path = node.path ? `${node.path}/${part}` : part;
      let child = node.folders.find((f) => f.name === part);
      if (!child) node.folders.push((child = { name: part, path, files: [], folders: [], total: 0 }));
      node = child;
      node.total++;
    }
    node.files.push(file);
  }
  // A `_Syllabus` folder first, then everything else by name.
  const sort = (node: TreeFolder) => {
    node.folders.sort((a, b) => Number(isSyllabusFolder(b.name)) - Number(isSyllabusFolder(a.name)) || byName(a.name, b.name));
    node.folders.forEach(sort);
  };
  sort(root);
  return root;
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
/** The groups after the syllabus and notes, in the order they're listed. */
const FOLDER_GROUPS: { kind: FolderKind; label: string; icon: LucideIcon }[] = [
  { kind: 'lab', label: 'Lab works', icon: Monitor },
  { kind: 'assignment', label: 'Assignments', icon: ClipboardList },
  { kind: 'questions', label: 'Question collections', icon: FileQuestion },
  { kind: 'extra', label: 'Extras', icon: Sparkles },
];
const FOLDER_ICON: Partial<Record<FolderKind, LucideIcon>> = { syllabus: ScrollText, ...Object.fromEntries(FOLDER_GROUPS.map((g) => [g.kind, g.icon])) };

/** A semester's past papers (/past-questions/semester-N), using the same file viewer as the notes. */
export function PastQuestionsPage(props: { semester: Semester; subject?: PastQuestionFolder; requestedFile?: NoteFile }) {
  return <PastQuestionsView {...props} renderPreview={(file) => <FilePreview key={file.id} file={file} />} />;
}

export function SubjectView({ semester, subject, requestedFile }: SubjectViewProps) {
  const tree = useMemo(() => buildTree(subject.files), [subject]);
  // Top to bottom: the `_Syllabus` folder, the notes (files at the subject root, then note folders),
  // then lab works, assignments, question collections and extras, each under its own label.
  const byKind = (kind: FolderKind) => tree.folders.filter((f) => folderKind(f.name) === kind);
  const syllabusFolders = byKind('syllabus');
  const noteFolders = byKind('notes');
  const groups = FOLDER_GROUPS.map((g) => ({ ...g, folders: byKind(g.kind) })).filter((g) => g.folders.length);

  // The open file lives in the URL (?file=…) so it can be shared; otherwise start on the first note.
  const activeFile = requestedFile;
  const hasFiles = subject.files.length > 0;
  const openFile = (file: NoteFile) => navigate(subjectPath(semester, subject, file), { replace: true });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const sidebar = useResizableSidebar();
  // In the 2025 view, this subject "belongs" to its 2025 semester (e.g. Applied Physics → Semester I),
  // even though its notes are filed under the earlier one.
  const structure = useStructure();
  const sem2025 = structure === '2025' ? semester2025For(subject) : undefined;
  const homeSemester = (sem2025 && semesters.find((s) => s.id === String(sem2025.id))) || semester;
  // This subject's past papers, if it has any (filed under the semester its notes are in).
  const pastPapers = pastQuestionFolders(semester).find((f) => f.papers > 0 && normalizeName(f.name) === normalizeName(subject.name));

  const toggleFolder = (folder: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });

  const renderFile = (file: NoteFile, nested: boolean) => (
    <button
      key={file.id}
      className={`file-row ${nested ? 'nested' : ''} ${file.id === activeFile?.id ? 'active' : ''}`}
      onClick={() => openFile(file)}
      title={file.name}
    >
      <span className={`file-badge ${file.kind}`}><FileKindIcon kind={file.kind} size={14} /></span>
      <span>
        <strong>{file.name}</strong>
        <small>{kindLabels[file.kind]} · {formatSize(file.size)}</small>
      </span>
    </button>
  );

  // A folder, then (when open) its files and subfolders indented beneath it. Top-level folders that
  // aren't notes (syllabus, lab works, …) get their own icon and color.
  const renderFolder = (folder: TreeFolder, top = false): ReactNode => {
    const open = !collapsed.has(folder.path);
    const kind = top ? folderKind(folder.name) : 'notes';
    const KindIcon = FOLDER_ICON[kind];
    return (
      <div key={folder.path} className={`tree-folder-block ${kind !== 'notes' ? `tree-folder-${kind}` : ''}`}>
        <button className="tree-folder" onClick={() => toggleFolder(folder.path)} title={folder.path} aria-expanded={open}>
          {open ? <ChevronDown size={13} className="tree-chevron" /> : <ChevronRight size={13} className="tree-chevron" />}
          {KindIcon
            ? <KindIcon size={15} className="tree-folder-icon" />
            : open ? <FolderOpen size={15} className="tree-folder-icon" /> : <Folder size={15} className="tree-folder-icon" />}
          <span>{folder.name.replace(/^_+/, '')}</span>
          <small className="tree-count">{folder.total}</small>
        </button>
        {open && (
          <div className="tree-children">
            {folder.files.map((file) => renderFile(file, true))}
            {folder.folders.map((f) => renderFolder(f))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <section className="subject-page">
        <BackArrow to={semesterPath(homeSemester)} label={homeSemester.label} inline />

        <div className="subject-box">
          <div className="subject-box-head">
            {hasFiles && (
              <button
                className="icon-button sidebar-toggle"
                onClick={sidebar.toggle}
                aria-label={sidebar.collapsed ? 'Show file list' : 'Hide file list'}
                aria-expanded={!sidebar.collapsed}
                title={`${sidebar.collapsed ? 'Show' : 'Hide'} file list (Ctrl + B)`}
              >
                {sidebar.collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
            <div className="subject-box-title">
              <span className="subject-code">{subject.code}</span>
              <h2>{subject.name}</h2>
              <span className="subject-meta">
                <span className="meta-chip meta-chip-semester">{homeSemester.label}</span>
                {subject.credits !== null && <span className="meta-chip">{plural(subject.credits, 'credit')}</span>}
                <span className="meta-chip">{plural(subject.files.length, 'file')}</span>
              </span>
            </div>
            {activeFile && (
              <div className="subject-box-file">
                <span className={`file-badge ${activeFile.kind}`}><FileKindIcon kind={activeFile.kind} size={13} /></span>
                <span className="subject-box-file-name" title={activeFile.path}>
                  {activeFile.folder && <small>{activeFile.folder} / </small>}
                  {activeFile.name}
                </span>
                <span className="subject-box-file-size">
                  {formatSize(activeFile.size)}{activeFile.updated ? ` · ${formatDate(activeFile.updated)}` : ''}
                </span>
                <DownloadButton file={activeFile} className="icon-button">
                  <Download size={15} />
                </DownloadButton>
                {activeFile.kind !== 'pdf' && (
                  <a className="icon-button" href={activeFile.url} target="_blank" rel="noreferrer" aria-label="Open file in new tab" title="Open in new tab">
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            )}
            <ShareButton title={`${subject.name} notes`} />
          </div>

            {hasFiles ? (
              <div
                // No file open yet: the file list takes most of the box ("browsing"); opening a file slides it
                // back to the sidebar. A collapsed sidebar only applies once a file is open.
                className={`file-body-full ${activeFile ? '' : 'is-browsing'} ${subject.units ? 'has-units' : ''} ${sidebar.collapsed && activeFile ? 'sidebar-collapsed' : ''} ${sidebar.dragging ? 'sidebar-dragging' : ''}`}
                style={{ '--sidebar-width': `${sidebar.width}px` } as CSSProperties}
              >
                <div className="file-tree" aria-hidden={sidebar.collapsed || undefined}>
                  {subject.description && (
                    <details className="subject-about">
                      <summary><Info size={13} /> About this subject</summary>
                      <p>{subject.description}</p>
                    </details>
                  )}
                  <div className="tree-title">
                    <span className="tree-title-label">Files</span>
                    <span className="tree-count">{subject.files.length}</span>
                  </div>
                  {syllabusFolders.map((folder) => (
                    <div key={folder.path} className="tree-group tree-group-syllabus">{renderFolder(folder, true)}</div>
                  ))}
                  {(tree.files.length > 0 || noteFolders.length > 0) && (
                    <div className="tree-group tree-group-notes">
                      {groups.length > 0 && <div className="tree-group-label"><BookOpenText size={12} /> Notes</div>}
                      {tree.files.map((file) => renderFile(file, false))}
                      {noteFolders.map((folder) => renderFolder(folder, true))}
                    </div>
                  )}
                  {groups.map(({ kind, label, icon: Icon, folders }) => (
                    <div key={kind} className={`tree-group tree-group-kind tree-group-${kind}`}>
                      <div className="tree-group-label"><Icon size={12} /> {label}</div>
                      {folders.map((folder) => renderFolder(folder, true))}
                    </div>
                  ))}
                </div>
                <div className="sidebar-resizer" {...sidebar.handleProps} />
                {activeFile ? (
                  <FilePreview key={activeFile.id} file={activeFile} />
                ) : (
                  <div className="preview-pane">
                    <div className={`pick-file ${subject.units ? 'has-units' : ''}`}>
                      <div className="pick-file-icon"><MousePointerClick size={30} /></div>
                      <h3>Pick a file to start reading</h3>
                      <p>
                        Choose any note from the list on the left and it will open right here. Use the
                        search, zoom and highlighter tools, or download it for offline study.
                      </p>
                      <span className="pick-file-hint"><ArrowLeft size={14} /> {plural(subject.files.length, 'file')} in {subject.name}</span>
                      {subject.units && (
                        <div className="subject-units">
                          <h3>{subject.name} units</h3>
                          <ol>
                            {subject.units.map(([name, hours], i) => (
                              <li key={name + i}><span>{name}</span>{hours ? <small>{hours} hrs</small> : null}</li>
                            ))}
                          </ol>
                          <div className="subject-units-links">
                            {pastPapers && <Link to={pastSubjectPath(semester, pastPapers.name)}>{subject.name} past questions</Link>}
                            {/^\d+$/.test(semester.id) && <Link to={syllabusPath(Number(semester.id))}>{semester.label} syllabus</Link>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="unsupported-preview subject-box-empty">
                <div className="large-file-icon"><FolderOpen size={28} /></div>
                <h3>No notes here yet</h3>
                <p>Nobody has added material for {subject.name} yet. Have notes for this subject? Share them with everyone.</p>
                <Link to="/contributing" className="download-button">How to contribute</Link>
              </div>
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
