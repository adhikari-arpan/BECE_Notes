import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  Info,
  MousePointerClick,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  ScrollText,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Link } from '@/components/Link';
import { navigate } from '@/content/router';
import { Loader } from '@/components/Loader';
import { DownloadButton } from '@/components/DownloadButton';
import { useResizableSidebar } from '@/components/useResizableSidebar';
import { formatDate, formatSize, isSyllabusFolder, plural, semesterPath, subjectPath, type FileKind, type NoteFile, type Semester, type Subject } from '@/content/notes';

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

export function SubjectView({ semester, subject, requestedFile }: SubjectViewProps) {
  const tree = useMemo(() => buildTree(subject.files), [subject]);
  // At the top: the `_Syllabus` folder, then files at the subject root, then other folders.
  const syllabusFolders = tree.folders.filter((f) => isSyllabusFolder(f.name));
  const otherFolders = tree.folders.filter((f) => !isSyllabusFolder(f.name));

  // The open file lives in the URL (?file=…) so it can be shared; otherwise start on the first note.
  const activeFile = requestedFile;
  const hasFiles = subject.files.length > 0;
  const openFile = (file: NoteFile) => navigate(subjectPath(semester, subject, file), { replace: true });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const sidebar = useResizableSidebar();

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

  // A folder, then (when open) its files and subfolders indented beneath it.
  const renderFolder = (folder: TreeFolder): ReactNode => {
    const open = !collapsed.has(folder.path);
    const syllabus = isSyllabusFolder(folder.name);
    return (
      <div key={folder.path} className={`tree-folder-block ${syllabus ? 'tree-folder-syllabus' : ''}`}>
        <button className="tree-folder" onClick={() => toggleFolder(folder.path)} title={folder.path} aria-expanded={open}>
          {open ? <ChevronDown size={13} className="tree-chevron" /> : <ChevronRight size={13} className="tree-chevron" />}
          {syllabus
            ? <ScrollText size={15} className="tree-folder-icon" />
            : open ? <FolderOpen size={15} className="tree-folder-icon" /> : <Folder size={15} className="tree-folder-icon" />}
          <span>{folder.name.replace(/^_+/, '')}</span>
          <small className="tree-count">{folder.total}</small>
        </button>
        {open && (
          <div className="tree-children">
            {folder.files.map((file) => renderFile(file, true))}
            {folder.folders.map(renderFolder)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <section className="subject-page">
        <Link to={semesterPath(semester)} className="back-button">
          <ArrowLeft size={16} /> Back to {semester.label}
        </Link>

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
                <span className="meta-chip meta-chip-semester">{semester.label}</span>
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
          </div>

            {hasFiles ? (
              <div
                className={`file-body-full ${sidebar.collapsed ? 'sidebar-collapsed' : ''} ${sidebar.dragging ? 'sidebar-dragging' : ''}`}
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
                    <div key={folder.path} className="tree-group tree-group-syllabus">{renderFolder(folder)}</div>
                  ))}
                  {tree.files.length > 0 && (
                    <div className="tree-group">{tree.files.map((file) => renderFile(file, false))}</div>
                  )}
                  {otherFolders.map((folder) => (
                    <div key={folder.path} className="tree-group">{renderFolder(folder)}</div>
                  ))}
                </div>
                <div className="sidebar-resizer" {...sidebar.handleProps} />
                {activeFile ? (
                  <FilePreview key={activeFile.id} file={activeFile} />
                ) : (
                  <div className="preview-pane">
                    <div className="pick-file">
                      <div className="pick-file-icon"><MousePointerClick size={30} /></div>
                      <h3>Pick a file to start reading</h3>
                      <p>
                        Choose any note from the list on the left and it will open right here. Use the
                        search, zoom and highlighter tools, or download it for offline study.
                      </p>
                      <span className="pick-file-hint"><ArrowLeft size={14} /> {plural(subject.files.length, 'file')} in {subject.name}</span>
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
