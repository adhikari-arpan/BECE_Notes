import { Coffee, ShieldCheck, CircleHelp, Eye, Heart, MousePointerClick, Users } from 'lucide-react';
import { formatCount, useSiteStats } from '@/content/visits';
import { Logo } from '@/components/Logo';
import { openTipJar } from '@/content/tipJar';
import { Link } from '@/components/Link';

export function Footer() {
  const { visitors, pageViews } = useSiteStats();

  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-mark"><Logo /></div>
            <div>
              <span className="brand-name">BECE Vault</span>
              <p>A curated library for Computer Engineering students at Pokhara University.</p>
            </div>
          </div>
          <nav className="footer-links">
            <Link to="/about"><CircleHelp size={15} /> About Us</Link>
            <Link to="/contributors"><Users size={15} /> Contributors</Link>
            <Link to="/contributing"><Heart size={15} /> Contribute</Link>
            <Link to="/privacy"><ShieldCheck size={15} /> Privacy Policy</Link>
            <button className="footer-chiya" onClick={openTipJar}><Coffee size={15} /> Buy me a Chiya</button>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>Started by <strong>Arpan Adhikari</strong> · Nepal College of Information Technology (NCIT)</p>
          {(visitors !== null || pageViews !== null) && (
            <span className="footer-stats">
              {visitors !== null && <span className="footer-visits"><Eye size={13} /> {formatCount(visitors)} visitors</span>}
              {pageViews !== null && <span className="footer-visits"><MousePointerClick size={13} /> {formatCount(pageViews)} page visits</span>}
            </span>
          )}
          <span>Made for students, by students. All materials belong to their original creators.</span>
        </div>
      </div>
    </footer>
  );
}
