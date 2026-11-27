import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Check, Facebook, Instagram, Link2, MessageCircle, Send, Share2 } from 'lucide-react';

const ShareCard = lazy(() => import('@/components/ShareCard').then((m) => ({ default: m.ShareCard })));

/**
 * Links and actions for sharing the current page. Shared links carry ?utm_source=… so /analytics can
 * count visits from shares (see trafficSource in visits.ts).
 */
export function useShareLinks(title: string) {
  const [copied, setCopied] = useState<false | 'link' | 'instagram'>(false);
  const text = `${title} on BECE Vault`;

  // The page being shared, with an open file kept (?file=…) and any old tracking tag dropped.
  const link = useCallback((source?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('utm_source');
    if (source) url.searchParams.set('utm_source', source);
    return url.toString();
  }, []);

  const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');
  const copy = () => {
    void navigator.clipboard?.writeText(link()).then(() => {
      setCopied('link');
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  // Instagram can't be pre-filled from a website: copy the link, then open Instagram's messages to paste it.
  const instagram = () => {
    void navigator.clipboard?.writeText(`${text}: ${link('instagram')}`).then(() => {
      setCopied('instagram');
      window.setTimeout(() => setCopied(false), 2400);
    });
    open('https://www.instagram.com/direct/inbox/');
  };

  return {
    text,
    link,
    copied,
    copy,
    instagram,
    whatsapp: () => open(`https://wa.me/?text=${encodeURIComponent(`${text}: ${link('whatsapp')}`)}`),
    facebook: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link('facebook'))}`),
    telegram: () => open(`https://t.me/share/url?url=${encodeURIComponent(link('telegram'))}&text=${encodeURIComponent(text)}`),
    /** The phone's own share sheet, where the browser has one. */
    native: typeof navigator !== 'undefined' && 'share' in navigator
      ? () => { navigator.share({ title: text, text, url: link('share') }).catch(() => {}); }
      : null,
  };
}

/**
 * "Share" for a page: on phones the phone's own share sheet (WhatsApp, Messenger, Instagram…), on
 * computers a small menu. The home page's pill opens a shareable card with a QR code instead.
 */
export function ShareButton({ title, variant = 'icon' }: { title: string; variant?: 'icon' | 'round' | 'pill' }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const s = useShareLinks(title);
  const card = variant === 'pill';

  useEffect(() => {
    if (!open || card) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open, card]);

  const share = () => {
    // Phones and tablets: the system share sheet lists every app the student has.
    if (!card && s.native && window.matchMedia('(pointer: coarse)').matches) {
      s.native();
      return;
    }
    setOpen((o) => !o);
  };
  const go = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className={`share share-${variant}`} ref={box}>
      <button
        className={variant === 'icon' ? 'icon-button share-trigger' : variant === 'pill' ? 'share-trigger share-pill' : 'share-trigger share-round'}
        onClick={share}
        aria-haspopup={card ? 'dialog' : 'menu'}
        aria-expanded={open}
        aria-label={variant === 'pill' ? undefined : 'Share this page'}
        title="Share this page"
        data-tip={variant === 'round' ? 'Share' : undefined}
      >
        <Share2 size={variant === 'round' ? 18 : 15} />
        {variant === 'pill' && 'Share with your class'}
      </button>
      {open && card && (
        <Suspense fallback={null}>
          <ShareCard share={s} onClose={() => setOpen(false)} />
        </Suspense>
      )}
      {open && !card && (
        <div className="share-menu" role="menu">
          <button role="menuitem" onClick={() => go(s.whatsapp)}>
            <MessageCircle size={15} /> WhatsApp
          </button>
          <button role="menuitem" onClick={() => go(s.facebook)}>
            <Facebook size={15} /> Facebook
          </button>
          <button role="menuitem" onClick={s.instagram}>
            {s.copied === 'instagram' ? <Check size={15} /> : <Instagram size={15} />} {s.copied === 'instagram' ? 'Link copied, paste it in Instagram' : 'Instagram'}
          </button>
          <button role="menuitem" onClick={() => go(s.telegram)}>
            <Send size={15} /> Telegram
          </button>
          <button role="menuitem" onClick={s.copy}>
            {s.copied === 'link' ? <Check size={15} /> : <Link2 size={15} />} {s.copied === 'link' ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
