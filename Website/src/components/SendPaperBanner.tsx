import { useEffect, useRef, useState } from 'react';
import { FileUp, Send, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { sessionStore } from '@/content/consent';
import './SendPaperBanner.css';

/** Shown once per visit: remembered for the tab (if cookies are accepted) and while the app stays open. */
const SHOWN_KEY = 'bece-notes:send-paper-toast';
let shownThisVisit = false;

const DELAY_MS = 2500;
const VISIBLE_MS = 10000;

/**
 * A small popup on the past questions pages inviting a missing paper through /send-paper. It slides in
 * shortly after the page opens and leaves by itself (hovering keeps it); once per visit, so moving
 * between pages doesn't bring it back. On a subject's page it names the subject and opens the form
 * with it already chosen.
 */
export function SendPaperBanner({ subject, folder }: { subject?: string; folder?: string }) {
  const [state, setState] = useState<'waiting' | 'shown' | 'leaving' | 'gone'>(() =>
    shownThisVisit || sessionStore.get(SHOWN_KEY) === '1' ? 'gone' : 'waiting');
  const hovered = useRef(false);

  // Appears after a moment, and only while the cookie banner and the tip-jar nudge (same corner) are away.
  useEffect(() => {
    if (state !== 'waiting') return;
    let timer: ReturnType<typeof setTimeout>;
    const tryShow = () => {
      if (document.querySelector('.cookie-banner.is-shown, .tip-nudge')) {
        timer = setTimeout(tryShow, 2000);
        return;
      }
      shownThisVisit = true;
      sessionStore.set(SHOWN_KEY, '1');
      setState('shown');
    };
    timer = setTimeout(tryShow, DELAY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // Leaves by itself after a while, unless the pointer is resting on it.
  useEffect(() => {
    if (state !== 'shown') return;
    const timer = setInterval(() => {
      if (!hovered.current) setState('leaving');
    }, VISIBLE_MS);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state !== 'leaving') return;
    const timer = setTimeout(() => setState('gone'), 280);
    return () => clearTimeout(timer);
  }, [state]);

  if (state === 'waiting' || state === 'gone') return null;
  return (
    <aside
      className={`sendpaper-toast ${state === 'leaving' ? 'is-leaving' : ''}`}
      aria-label="Send a past paper"
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => { hovered.current = false; }}
    >
      <span className="sendpaper-toast-icon"><FileUp size={18} /></span>
      <div className="sendpaper-toast-body">
        <strong>Have a{subject ? ` ${subject}` : ''} paper that’s missing here?</strong>
        <span>Send the PDF in a minute. No GitHub or sign-up needed.</span>
        <Link to={folder ? `/send-paper?subject=${encodeURIComponent(folder)}` : '/send-paper'} className="sendpaper-toast-button">
          <Send size={13} /> Send a paper
        </Link>
      </div>
      <button type="button" className="sendpaper-toast-close" onClick={() => setState('leaving')} aria-label="Close" title="Close"><X size={15} /></button>
    </aside>
  );
}
