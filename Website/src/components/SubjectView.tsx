import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { marked } from 'marked';
import {
  ArrowDownToLine,
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
import { Loader } from '@/components/Loader';
import { DownloadButton } from '@/components/DownloadButton';
import { useResizableSidebar } from '@/components/useResizableSidebar';
import { formatDate, formatSize, isSyllabusFolder, plural, type FileKind, type NoteFile, type Semester, type Subject } from '@/content/notes';

const PdfViewer = lazy(() => import('@/components/PdfViewer'));

const kindLabels: Record<FileKind, string> = {
  pdf: 'PDF', doc: 'Word', slides: 'Slides', sheet: 'Sheet', image: 'Image', markdown: 'Markdown', code: 'Code', text: 'Text', other: 'File',
};

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
  /** File to show first; defaults to the subject's first file. */
  initialFileId?: string;
  semester: Semester;
  subject: Subject;
  onBack: () => void;
  onContributing: () => void;
}

export function SubjectView({ semester, subject, initialFileId, onBack, onContributing }: SubjectViewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, NoteFile[]>();
    for (const file of subject.files) map.set(file.folder, [...(map.get(file.folder) ?? []), file]);
    // The subject's `_Syllabus` folder first, then files at the subject root, then other folders.
    const rank = (folder: string) => (isSyllabusFolder(folder) ? 0 : folder === '' ? 1 : 2);
    return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true }));
  }, [subject]);

  // Open on the first note (not the syllabus) unless a specific file was requested.
  const firstNote = subject.files.find((f) => !isSyllabusFolder(f.folder)) ?? subject.files[0];
  const [activeFileId, setActiveFileId] = useState(initialFileId ?? firstNote?.id ?? '');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const activeFile = subject.files.find((f) => f.id === activeFileId) ?? subject.files[0];
  const sidebar = useResizableSidebar();

  const toggleFolder = (folder: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });

  return (
    <>
      <section className="subject-page">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to {semester.label}
        </button>

        <div className="subject-box">
          <div className="subject-box-head">
            {activeFile && (
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

            {activeFile ? (
              <div
                className={`file-body-full ${sidebar.collapsed ? 'sidebar-collapsed' : ''} ${sidebar.dragging ? 'sidebar-dragging' : ''}`}
                style={{ '--sidebar-width': `${sidebar.width}px` } as CSSProperties}
              >
                <div className="file-tree" aria-hidden={sidebar.collapsed || undefined}>
                  <div className="tree-title">
                    <span className="tree-title-label">Files</span>
                    <span className="tree-count">{subject.files.length}</span>
                  </div>
                  {groups.map(([folder, files]) => (
                    <div key={folder} className={`tree-group ${isSyllabusFolder(folder) ? 'tree-group-syllabus' : ''}`}>
                      {folder && (
                        <button className="tree-folder" onClick={() => toggleFolder(folder)} title={folder}>
                          {collapsed.has(folder) ? <ChevronRight size={13} className="tree-chevron" /> : <ChevronDown size={13} className="tree-chevron" />}
                          {isSyllabusFolder(folder)
                            ? <ScrollText size={15} className="tree-folder-icon" />
                            : collapsed.has(folder) ? <Folder size={15} className="tree-folder-icon" /> : <FolderOpen size={15} className="tree-folder-icon" />}
                          <span>
                            {folder.includes('/') && <em>{folder.slice(0, folder.lastIndexOf('/') + 1).replace(/^_+/, '')}</em>}
                            {folder.slice(folder.lastIndexOf('/') + 1).replace(/^_+/, '')}
                          </span>
                          <small className="tree-count">{files.length}</small>
                        </button>
                      )}
                      {!collapsed.has(folder) && files.map((file) => (
                        <button
                          key={file.id}
                          className={`file-row ${folder ? 'nested' : ''} ${file.id === activeFile.id ? 'active' : ''}`}
                          onClick={() => setActiveFileId(file.id)}
                          title={file.name}
                        >
                          <span className={`file-badge ${file.kind}`}><FileKindIcon kind={file.kind} size={14} /></span>
                          <span>
                            <strong>{file.name}</strong>
                            <small>{kindLabels[file.kind]} · {formatSize(file.size)}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="sidebar-resizer" {...sidebar.handleProps} />
                <FilePreview key={activeFile.id} file={activeFile} />
              </div>
            ) : (
              <div className="unsupported-preview subject-box-empty">
                <div className="large-file-icon"><FolderOpen size={28} /></div>
                <h3>No notes here yet</h3>
                <p>Nobody has added material for {subject.name} yet. Have notes for this subject? Share them with everyone.</p>
                <button className="download-button" onClick={onContributing}>How to contribute</button>
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
    return <article className="markdown-preview" dangerouslySetInnerHTML={{ __html: marked.parse(text, { async: false }) }} />;
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
