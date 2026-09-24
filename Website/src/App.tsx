import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { semesters } from '@/content/notes';
import { HomeView } from '@/components/HomeView';
import { SemesterView } from '@/components/SemesterView';
import { SubjectView } from '@/components/SubjectView';
import { AboutView } from '@/components/AboutView';
import { ContributorsView } from '@/components/ContributorsView';
import { ContributingView } from '@/components/ContributingView';
import { Footer } from '@/components/Footer';

type Page = 'home' | 'semester' | 'subject' | 'about' | 'contributors' | 'contributing';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [activeSemesterId, setActiveSemesterId] = useState<string>('1');
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');

  const goHome = () => {
    setPage('home');
    setActiveSubjectId('');
  };

  const openSemester = (id: string) => {
    setActiveSemesterId(id);
    setActiveSubjectId('');
    setPage('semester');
  };

  const openSubject = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    setPage('subject');
  };

  const backToSemester = () => {
    setActiveSubjectId('');
    setPage('semester');
  };

  const activeSemester = semesters.find((s) => s.id === activeSemesterId) ?? semesters[0];
  const activeSubject = activeSemester.subjects.find((s) => s.id === activeSubjectId) ?? null;

  return (
    <div className={`app-shell ${page === 'subject' ? 'app-shell-fixed' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-lockup" onClick={goHome}>
            <div className="brand-mark"><BookOpen size={19} strokeWidth={2.4} /></div>
            <div>
              <span className="brand-name">BECE</span>
              <span className="brand-divider">/</span>
              <span className="brand-context">Notes library</span>
            </div>
          </button>
          <nav className="top-actions">
            {page !== 'home' && <button className="text-button" onClick={goHome}>Home</button>}
            <span className="status-pill"><span className="status-dot" /> Open collection</span>
          </nav>
        </div>
      </header>

      <main>
        {page === 'home' && (
          <HomeView
            onSelectSemester={openSemester}
            onNavigate={(p) => setPage(p)}
          />
        )}
        {page === 'semester' && (
          <SemesterView
            semester={activeSemester}
            onSelectSubject={openSubject}
            onBack={goHome}
          />
        )}
        {page === 'subject' && activeSubject && (
          <SubjectView
            key={activeSubject.id}
            semester={activeSemester}
            subject={activeSubject}
            onBack={backToSemester}
            onContributing={() => setPage('contributing')}
          />
        )}
        {page === 'about' && <AboutView onBack={goHome} />}
        {page === 'contributors' && (
          <ContributorsView
            onBack={goHome}
            onContributing={() => setPage('contributing')}
          />
        )}
        {page === 'contributing' && <ContributingView onBack={() => setPage('contributors')} />}
      </main>

      {page !== 'subject' && <Footer onNavigate={(p) => setPage(p)} />}
    </div>
  );
}

export default App;
