import { BookOpen, CircleHelp, Eye, Heart, Users } from 'lucide-react';
import { formatCount, useVisitCount } from '@/content/visits';

interface FooterProps {
  onNavigate: (page: 'about' | 'contributors' | 'contributing') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const visits = useVisitCount();

  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-mark"><BookOpen size={19} strokeWidth={2.4} /></div>
            <div>
              <span className="brand-name">BECE Notes</span>
              <p>A curated library for Computer Engineering students at Pokhara University.</p>
            </div>
          </div>
          <nav className="footer-links">
            <button onClick={() => onNavigate('about')}><CircleHelp size={15} /> About Us</button>
            <button onClick={() => onNavigate('contributors')}><Users size={15} /> Contributors</button>
            <button onClick={() => onNavigate('contributing')}><Heart size={15} /> Contribute</button>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>Started by <strong>Arpan Adhikari</strong> · Nepal College of Information Technology (NCIT)</p>
          {visits !== null && (
            <span className="footer-visits"><Eye size={13} /> {formatCount(visits)} visits</span>
          )}
          <span>Made for students, by students. All materials belong to their original creators.</span>
        </div>
      </div>
    </footer>
  );
}
