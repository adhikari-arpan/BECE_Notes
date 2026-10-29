import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { AnalyticsData } from '@/content/analytics';
import { SITE_LIBRARY } from '@/content/sponsor';

/** A two-page sponsor pitch PDF made from the live numbers (used on /analytics and /sponsor). */
export function DownloadPitch({ data, className = 'an-btn an-btn-primary' }: { data: AnalyticsData | null; className?: string }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (!data) return;
    setBusy(true);
    try {
      const { createPitchPdf, pitchFileName } = await import('@/content/analyticsReport');
      const { saveBlob } = await import('@/content/watermark');
      saveBlob(new Blob([(await createPitchPdf(data, SITE_LIBRARY)) as BlobPart], { type: 'application/pdf' }), pitchFileName());
    } finally {
      setBusy(false);
    }
  };
  return (
    <button className={className} onClick={() => void download()} disabled={busy || !data} title="A two-page PDF for sponsors, with the live numbers">
      {busy ? <Loader2 size={14} className="spin" /> : <Download size={14} />} Download pitch (PDF)
    </button>
  );
}
