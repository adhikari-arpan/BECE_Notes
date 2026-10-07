import { BookOpen, Calculator, GraduationCap, ScrollText, CircleHelp, Coffee, Cookie, Eye, Github, Heart, Home, Mail, MousePointerClick, ShieldCheck, Users } from 'lucide-react';
import { formatCount, useSiteStats } from '@/content/visits';
import { Logo } from '@/components/Logo';
import { openTipJar } from '@/content/tipJar';
import { openCookieSettings } from '@/content/consent';
import { semesterPath, semesters } from '@/content/notes';
import { Link } from '@/components/Link';

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';
const REPO_URL = 'https://github.com/adhikari-arpan/BECE_Notes';

export function Footer() {
  const { visitors, pageViews } = useSiteStats();

  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-lockup">
              <div className="brand-mark"><Logo /></div>
              <span className="brand-name">BECE Vault</span>
            </Link>
            <p>
              A free, semester-wise library of notes, past questions and syllabus for Computer Engineering students at
              Pokhara University.
            </p>
            {(visitors !== null || pageViews !== null) && (
              <span className="footer-stats">
                {visitors !== null && <span className="footer-visits"><Eye size={13} /> {formatCount(visitors)} visitors</span>}
                {pageViews !== null && <span className="footer-visits"><MousePointerClick size={13} /> {formatCount(pageViews)} page visits</span>}
              </span>
            )}
            <button className="footer-chiya-button" onClick={openTipJar}><Coffee size={15} /> Buy me a Chiya</button>
          </div>

          <nav className="footer-col" aria-label="Semesters">
            <h4>Semesters</h4>
            <div className="footer-semesters">
              {semesters.map((s) => (
                <Link key={s.id} to={semesterPath(s)}><BookOpen size={14} /> {s.label}</Link>
              ))}
            </div>
          </nav>

          <nav className="footer-col" aria-label="Explore">
            <h4>Explore</h4>
            <Link to="/"><Home size={15} /> Home</Link>
            <Link to="/cgpa-calculator"><Calculator size={15} /> CGPA Calculator</Link>
            <Link to="/syllabus"><ScrollText size={15} /> Syllabus</Link>
            <Link to="/pu-grading-system"><GraduationCap size={15} /> PU Grading Guide</Link>
            <Link to="/about"><CircleHelp size={15} /> About Us</Link>
            <Link to="/contributors"><Users size={15} /> Contributors</Link>
            <Link to="/contributing"><Heart size={15} /> Contribute</Link>
          </nav>

          <nav className="footer-col" aria-label="Site">
            <h4>Site</h4>
            <Link to="/privacy"><ShieldCheck size={15} /> Privacy Policy</Link>
            <button onClick={openCookieSettings}><Cookie size={15} /> Cookie settings</button>
            <a href={REPO_URL} target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
            <a href={`mailto:${CONTACT_EMAIL}`}><Mail size={15} /> Contact</a>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BECE Vault · Started by <a className="footer-author" href="https://www.arpanadhikari7.com.np" target="_blank" rel="noreferrer">Arpan Adhikari</a></p>
          <span>
            Made for students, by students. Original notes:{' '}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer license">CC BY-NC-SA 4.0</a> · Code:{' '}
            <a href="https://github.com/adhikari-arpan/BECE_Notes/blob/main/Website/LICENSE" target="_blank" rel="noreferrer license">MIT</a>.
            Other materials belong to their creators.
          </span>
        </div>
      </div>
    </footer>
  );
}
