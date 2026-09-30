import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { closeCookieBanner, setConsent, useConsent } from '@/content/consent';

/**
 * The cookie consent bar: a long pill floating at the bottom of the screen on a first visit
 * (and when reopened from "Cookie settings" in the footer). The choice covers saving things on the
 * device (theme, sidebar, CGPA grades, PDF highlights); anonymous site statistics always run.
 */
export function CookieBanner() {
  const { consent, bannerOpen } = useConsent();
  const [shown, setShown] = useState(false);

  // On a first visit, let the page appear first, then slide the bar up.
  useEffect(() => {
    if (!bannerOpen) return setShown(false);
    const timer = window.setTimeout(() => setShown(true), consent === null ? 700 : 0);
    return () => window.clearTimeout(timer);
  }, [bannerOpen, consent]);

  if (!bannerOpen) return null;

  return (
    <div className={`cookie-banner ${shown ? 'is-shown' : ''}`} role="region" aria-label="Cookie consent">
      <span className="cookie-banner-icon" aria-hidden="true"><Cookie size={19} /></span>
      <p>
        <strong>Allow cookies?</strong> They let the site remember your theme, CGPA grades and PDF highlights on this
        device. Without them, these work only until you close the site. View more in our{' '}
        <Link to="/privacy">Privacy Policy</Link>.
        {consent && <span className="cookie-banner-current"> · Currently {consent === 'accepted' ? 'accepted' : 'declined'}</span>}
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-decline" onClick={() => setConsent('declined')}>Decline</button>
        <button className="cookie-accept" onClick={() => setConsent('accepted')}>Accept</button>
        {consent && (
          <button className="cookie-close" onClick={closeCookieBanner} aria-label="Close without changing"><X size={15} /></button>
        )}
      </div>
    </div>
  );
}
