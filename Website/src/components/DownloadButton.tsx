import { useState, type MouseEvent, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { NoteFile } from '@/content/notes';
import { downloadWithCredit } from '@/content/watermark';
import { nudgeAfterDownload } from '@/content/tipJar';

interface DownloadButtonProps {
  file: NoteFile;
  className: string;
  children: ReactNode;
  title?: string;
}

/** Download link that adds the "Downloaded from …" credit to PDFs and images before saving. */
export function DownloadButton({ file, className, children, title = 'Download' }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  const onClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await downloadWithCredit(file.url, file.name, file.kind);
      nudgeAfterDownload();
    } catch {
      // Network/CORS trouble: fall back to the plain file so the download still works.
      window.open(file.url, '_blank', 'noopener');
    } finally {
      setBusy(false);
    }
  };

  return (
    <a
      className={`${className} ${busy ? 'is-busy' : ''}`}
      href={file.url}
      download={file.name}
      onClick={onClick}
      aria-label={busy ? 'Preparing download' : title}
      aria-busy={busy}
      title={busy ? 'Preparing download…' : title}
    >
      {busy ? <LoaderCircle size={15} className="spin" /> : children}
    </a>
  );
}
