import { lazy, Suspense, useEffect } from 'react';
import { findSemester, findSubject, fileKey } from '@/content/notes';
import { HomeView } from '@/components/HomeView';
import { SemesterView } from '@/components/SemesterView';
import { Loader } from '@/components/Loader';
import { semesters2025 } from '@/content/curriculum2025';
import { PU_GUIDE_DESCRIPTION, PU_GUIDE_TITLE } from '@/content/puGuide';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChiyaButton, TipJar } from '@/components/TipJar';
import { Logo } from '@/components/Logo';
import { Link } from '@/components/Link';
import { useLocation } from '@/content/router';
import { trackPageView } from '@/content/visits';
import { SITE_URL } from '@/content/watermark';

// Pages other than home/semester/subject load their code only when opened, keeping the first download small.
const SubjectView = lazy(() => import('@/components/SubjectView').then((m) => ({ default: m.SubjectView })));
const AboutView = lazy(() => import('@/components/AboutView').then((m) => ({ default: m.AboutView })));
const ContributorsView = lazy(() => import('@/components/ContributorsView').then((m) => ({ default: m.ContributorsView })));
const ContributingView = lazy(() => import('@/components/ContributingView').then((m) => ({ default: m.ContributingView })));
const NotFoundView = lazy(() => import('@/components/NotFoundView').then((m) => ({ default: m.NotFoundView })));
const PrivacyView = lazy(() => import('@/components/PrivacyView').then((m) => ({ default: m.PrivacyView })));
const CgpaView = lazy(() => import('@/components/CgpaView').then((m) => ({ default: m.CgpaView })));
const GradingGuideView = lazy(() => import('@/components/GradingGuideView').then((m) => ({ default: m.GradingGuideView })));
const SyllabusView = lazy(() => import('@/components/SyllabusView').then((m) => ({ default: m.SyllabusView })));

/** "Semester 1 (I)" / "Semester 1": people search with digits, the curriculum uses Roman numerals. */
const semNumber = (s: { id: string }) => (/^\d+$/.test(s.id) ? s.id : null);
const semFull = (s: { id: string; label: string }) => (semNumber(s) ? `Semester ${s.id} (${s.label.replace('Semester ', '')})` : s.label);
const semShort = (s: { id: string; label: string }) => (semNumber(s) ? `Semester ${s.id}` : s.label);

const SITE_TITLE = 'BECE Vault — BECE Notes for Pokhara University BE Computer Engineering';
/** The site-wide description from index.html, restored on pages without their own. */
let defaultDescription = '';

/**
 * Routes:
 *   /                                 home
 *   /about, /contributors, /contributing, /privacy, /cgpa-calculator, /pu-grading-system
 *   /syllabus, /syllabus/semester-1   the syllabus: all semesters, or one semester's courses (follows the structure switch)
 *   /semester-1, /electives, ...      a semester (or collection)
 *   /semester-1/programming-in-c      a subject; ?file=<path in subject> opens a specific file
 */
function App() {
  const { pathname, params } = useLocation();
  const [first, second] = pathname.split('/').filter(Boolean);

  const staticPage = !second && (first === 'about' || first === 'contributors' || first === 'contributing' || first === 'privacy' || first === 'cgpa-calculator' || first === 'pu-grading-system' || first === 'syllabus') ? first : null;
  // /syllabus/semester-N
  const syllabusSemester = first === 'syllabus' && second ? semesters2025.find((s) => `semester-${s.id}` === second) : undefined;
  const semester = !staticPage && first && first !== 'syllabus' ? findSemester(first) : undefined;
  const subject = semester && second ? findSubject(semester, second) : undefined;

  const page = pathname === '/' ? 'home'
    : staticPage ?? (syllabusSemester ? 'syllabus-semester' : subject ? 'subject' : semester && !second ? 'semester' : 'not-found');

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

  // A description per page — the grey text under the title in search results.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) return;
    if (!defaultDescription) defaultDescription = meta.content;
    const clip = (text: string) => (text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text);
    meta.content = subject && semester
      ? clip(`${subject.name}${subject.kind === 'course' ? ` (${subject.code})` : ''} notes for ${semShort(semester)}, Pokhara University BECE. ${subject.description ?? 'Lecture notes, past questions and resources.'}`)
      : semester
        ? clip(`${semFull(semester)} notes for Pokhara University BE Computer Engineering: ${semester.subjects.filter((s) => s.kind === 'course').map((s) => s.name).join(', ')}.`)
        : staticPage === 'cgpa-calculator'
          ? 'Free CGPA and SGPA calculator for Pokhara University BE Computer Engineering (BECE), with every semester’s subjects, credit hours and the official PU grading scale.'
          : staticPage === 'pu-grading-system'
            ? clip(PU_GUIDE_DESCRIPTION)
            : staticPage === 'syllabus'
              ? 'Pokhara University BE Computer Engineering syllabus: all 8 semesters with course codes, credit hours, lecture/tutorial/practical hours and course summaries.'
              : syllabusSemester
                ? clip(`${syllabusSemester.label} syllabus, Pokhara University BE Computer Engineering: ${syllabusSemester.courses.map((c) => c.name).join(', ')}.`)
                : defaultDescription;
  }, [semester, subject, staticPage, syllabusSemester]);

  // Each page's official address, so search engines index every semester/subject page on its own
  // (without ?file=…, so a subject is one page, not one per file). Missing pages are kept out of results.
  useEffect(() => {
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', page === 'not-found' ? 'noindex, follow' : 'index, follow');
  }, [pathname, page]);

  // A title per page, for browser tabs, bookmarks and search results.
  useEffect(() => {
    const titles: Record<string, string> = { about: 'About', contributors: 'Contributors', contributing: 'Contribute', privacy: 'Privacy Policy', 'cgpa-calculator': 'CGPA Calculator — Pokhara University BECE', 'pu-grading-system': PU_GUIDE_TITLE, syllabus: 'BE Computer Engineering Syllabus — Pokhara University' };
    document.title = page === 'home' ? SITE_TITLE
      : staticPage ? `${titles[staticPage]} | BECE Vault`
      : syllabusSemester ? `${syllabusSemester.label} Syllabus — PU BE Computer Engineering | BECE Vault`
      : subject && semester ? `${subject.name} Notes — ${semShort(semester)}, Pokhara University BECE | BECE Vault`
      : semester ? `${semFull(semester)} Notes — Pokhara University BE Computer Engineering | BECE Vault`
      : 'Page not found | BECE Vault';
  }, [page, staticPage, semester, subject, syllabusSemester]);

  return (
    <div className={`app-shell ${page === 'subject' ? 'app-shell-fixed' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-lockup">
            <div className="brand-mark"><Logo /></div>
            <div>
              <span className="brand-name">BECE Vault</span>
              <span className="brand-divider">/</span>
              <span className="brand-context">Notes library</span>
            </div>
          </Link>
          <nav className="top-actions">
            {page !== 'home' && <Link to="/" className="text-button">Home</Link>}
            {page !== 'cgpa-calculator' && <Link to="/cgpa-calculator" className="text-button">CGPA Calculator</Link>}
            <ChiyaButton />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        {page === 'home' && <HomeView />}
        {page === 'semester' && semester && <SemesterView semester={semester} />}
        <Suspense fallback={<div className="page-loading"><Loader /></div>}>
        {page === 'subject' && semester && subject && (
          <SubjectView key={subject.id} semester={semester} subject={subject} requestedFile={initialFile} />
        )}
        {page === 'about' && <AboutView />}
        {page === 'contributors' && <ContributorsView />}
        {page === 'contributing' && <ContributingView />}
        {page === 'privacy' && <PrivacyView />}
        {page === 'cgpa-calculator' && <CgpaView />}
        {page === 'pu-grading-system' && <GradingGuideView />}
        {page === 'syllabus' && <SyllabusView />}
        {page === 'syllabus-semester' && <SyllabusView semesterId={syllabusSemester!.id} />}
        {page === 'not-found' && <NotFoundView />}
        </Suspense>
      </main>

      {page !== 'subject' && <Footer />}
      <TipJar />
    </div>
  );
}

export default App;
