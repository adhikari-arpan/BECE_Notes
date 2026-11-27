import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Facebook, Globe, Instagram, Link2, Mail, MessageCircle, Send, Share2, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { useShareLinks } from '@/components/ShareButton';
import { pastQuestionCollections, semesters } from '@/content/notes';
import { SITE_HOST } from '@/content/watermark';
import './ShareCard.css';

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';
/** Opens the home page with ?utm_source=qr, so /analytics counts scans (made with segno, see the commit). */
const QR_URL = `${import.meta.env.BASE_URL}images/share-qr.svg`;

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id)).length;
const papers = pastQuestionCollections.reduce((sum, c) => sum + c.files.length, 0);

/** The home page's "Share with your class": a business card with a QR code, and where to send the link. */
export function ShareCard({ share, onClose }: { share: ReturnType<typeof useShareLinks>; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  const targets = [
    { label: 'WhatsApp', icon: <MessageCircle size={19} />, onClick: share.whatsapp, cls: 'is-whatsapp' },
    { label: 'Facebook', icon: <Facebook size={19} />, onClick: share.facebook, cls: 'is-facebook' },
    {
      label: share.copied === 'instagram' ? 'Copied, paste it' : 'Instagram',
      icon: share.copied === 'instagram' ? <Check size={19} /> : <Instagram size={19} />,
      onClick: share.instagram,
      cls: 'is-instagram',
    },
    { label: 'Telegram', icon: <Send size={19} />, onClick: share.telegram, cls: 'is-telegram' },
    {
      label: share.copied === 'link' ? 'Copied' : 'Copy link',
      icon: share.copied === 'link' ? <Check size={19} /> : <Link2 size={19} />,
      onClick: share.copy,
      cls: 'is-copy',
    },
    ...(share.native ? [{ label: 'More', icon: <Share2 size={19} />, onClick: share.native, cls: 'is-more' }] : []),
  ];

  return createPortal(
    <div className="sc-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sc-dialog" role="dialog" aria-modal="true" aria-labelledby="sc-title" tabIndex={-1} ref={dialog}>
        <button className="sc-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        <article className="sc-card">
          <div className="sc-main">
            <div className="sc-brand">
              <div className="sc-logo"><Logo /></div>
              <div>
                <h3 id="sc-title">BECE Vault</h3>
                <span>Pokhara University · BE Computer</span>
              </div>
            </div>
            <ul className="sc-points">
              <li><Check size={14} /> Notes for all {courseSemesters} semesters</li>
              <li><Check size={14} /> {papers.toLocaleString('en-US')} past exam papers</li>
              <li><Check size={14} /> Syllabus, labs &amp; CGPA calculator</li>
              <li><Check size={14} /> Free, no sign-up needed</li>
            </ul>
            <div className="sc-contact">
              <a href={`https://${SITE_HOST}`} target="_blank" rel="noreferrer"><Globe size={13} /> {SITE_HOST}</a>
              <a href={`mailto:${CONTACT_EMAIL}`}><Mail size={13} /> {CONTACT_EMAIL}</a>
            </div>
          </div>
          <div className="sc-qr">
            <div className="sc-qr-box"><img src={QR_URL} alt={`QR code for ${SITE_HOST}`} width={132} height={132} /></div>
            <span>Scan to open</span>
          </div>
        </article>

        <div className="sc-share">
          <p>Share it with your class</p>
          <div className="sc-targets">
            {targets.map((t) => (
              <button key={t.cls} className={`sc-target ${t.cls}`} onClick={t.onClick}>
                <span className="sc-target-icon">{t.icon}</span>
                <span className="sc-target-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
