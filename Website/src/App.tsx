import { useEffect } from 'react';
import { findSemester, findSubject, fileKey } from '@/content/notes';
import { HomeView } from '@/components/HomeView';
import { SemesterView } from '@/components/SemesterView';
import { SubjectView } from '@/components/SubjectView';
import { AboutView } from '@/components/AboutView';
import { ContributorsView } from '@/components/ContributorsView';
import { ContributingView } from '@/components/ContributingView';
import { NotFoundView } from '@/components/NotFoundView';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { Link } from '@/components/Link';
import { useLocation } from '@/content/router';
import { trackPageView } from '@/content/visits';

const SITE_TITLE = 'BECE Notes — Pokhara University Computer Engineering Notes';

/**
 * Routes:
 *   /                                 home
 *   /about, /contributors, /contributing
 *   /semester-1, /electives, ...      a semester (or collection)
 *   /semester-1/programming-in-c      a subject; ?file=<path in subject> opens a specific file
 */
function App() {
  const { pathname, params } = useLocation();
  const [first, second] = pathname.split('/').filter(Boolean);

  const staticPage = !second && (first === 'about' || first === 'contributors' || first === 'contributing') ? first : null;
  const semester = !staticPage && first ? findSemester(first) : undefined;
  const subject = semester && second ? findSubject(semester, second) : undefined;

  const page = pathname === '/' ? 'home'
    : staticPage ?? (subject ? 'subject' : semester && !second ? 'semester' : 'not-found');

  const requestedFile = params.get('file');
  const initialFile = subject && requestedFile ? subject.files.find((f) => fileKey(subject, f) === requestedFile) : undefined;

  // Opening another page starts at the top, not mid-scroll (switching files within a subject doesn't).
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Every page opened (home, a semester, a subject, about...) counts as one page visit.
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // A title per page, for browser tabs, bookmarks and search results.
  useEffect(() => {
    const titles: Record<string, string> = { about: 'About', contributors: 'Contributors', contributing: 'Contribute' };
    document.title = page === 'home' ? SITE_TITLE
      : staticPage ? `${titles[staticPage]} | BECE Notes`
      : subject && semester ? `${subject.name} — ${semester.label} Notes | BECE Notes`
      : semester ? `${semester.label} Notes — Pokhara University BECE | BECE Notes`
      : 'Page not found | BECE Notes';
  }, [page, staticPage, semester, subject]);

  return (
    <div className={`app-shell ${page === 'subject' ? 'app-shell-fixed' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-lockup">
            <div className="brand-mark"><Logo /></div>
            <div>
              <span className="brand-name">BECE</span>
              <span className="brand-divider">/</span>
              <span className="brand-context">Notes library</span>
            </div>
          </Link>
          <nav className="top-actions">
            {page !== 'home' && <Link to="/" className="text-button">Home</Link>}
            <span className="status-pill"><span className="status-dot" /> Open collection</span>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        {page === 'home' && <HomeView />}
        {page === 'semester' && semester && <SemesterView semester={semester} />}
        {page === 'subject' && semester && subject && (
          <SubjectView key={subject.id} semester={semester} subject={subject} requestedFile={initialFile} />
        )}
        {page === 'about' && <AboutView />}
        {page === 'contributors' && <ContributorsView />}
        {page === 'contributing' && <ContributingView />}
        {page === 'not-found' && <NotFoundView />}
      </main>

      {page !== 'subject' && <Footer />}
    </div>
  );
}

export default App;
