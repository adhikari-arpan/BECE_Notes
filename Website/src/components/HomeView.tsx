import {
  ChevronRight,
  Users,
  CircleHelp,
  Heart,
  Eye,
  MousePointerClick,
  FileText,
  Layers,
  HardDrive,
} from 'lucide-react';
import { allFiles, formatSize, semesters } from '@/content/notes';
import { formatCount, useSiteStats } from '@/content/visits';
import { CountUp } from '@/components/CountUp';
import { Logo } from '@/components/Logo';

interface HomeViewProps {
  onSelectSemester: (id: string) => void;
  onNavigate: (page: 'about' | 'contributors' | 'contributing') => void;
}

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id));
const subjectsWithNotes = semesters.flatMap((s) => s.subjects).filter((s) => s.files.length > 0).length;
const totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0);

export function HomeView({ onSelectSemester, onNavigate }: HomeViewProps) {
  const { visitors, pageViews } = useSiteStats();

  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Pokhara University · Computer Engineering</div>
          <h1>Your notes,<br /><em>in one place.</em></h1>
          <p className="hero-lede">A calm, organized home for every lecture note, question paper, and resource across your BECE journey. Pick a semester to explore its subjects.</p>
          <div className="hero-stats">
            <div><strong><CountUp value={courseSemesters.length} pad={2} /></strong><span>Semesters</span></div>
            <div><strong><CountUp value={subjectsWithNotes} /></strong><span>Subjects with notes</span></div>
            <div><strong><CountUp value={allFiles.length} /></strong><span>Files</span></div>
            <div><strong><CountUp value={visitors} /></strong><span>Visitors</span></div>
            <div><strong><CountUp value={pageViews} /></strong><span>Page visits</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-card hero-card-back"><span>BECE</span><b>Study smarter.</b></div>
          <div className="hero-card hero-card-front">
            <div className="mini-icon"><Logo /></div>
            <span>THE LIBRARY</span>
            <strong>Notes that<br />move with you.</strong>
            <div className="card-footer"><span>PU</span><span>●</span></div>
          </div>
        </div>
      </section>

      <section className="semester-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">The curriculum</span><h2>Choose a semester</h2></div>
          <span className="semester-count">01 — {String(courseSemesters.length).padStart(2, '0')} · extras</span>
        </div>
        <div className="semester-tabs">
          {semesters.map((semester) => (
            <button key={semester.id} className="semester-tab" onClick={() => onSelectSemester(semester.id)}>
              <span className="semester-number">{semester.badge}</span>
              <span><small>{semester.year}</small><b>{semester.label}</b></span>
              <span className="tab-subject-count">{semester.subjects.filter((s) => s.files.length > 0).length}/{semester.subjects.length} with notes</span>
              <ChevronRight size={16} className="tab-arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="about-section section-wrap">
        <div className="about-grid">
          <button className="about-card" onClick={() => onNavigate('about')}>
            <CircleHelp size={20} /><h3>About this collection</h3>
            <p>Curated study materials for the BECE program under Pokhara University, Nepal.</p>
          </button>
          <button className="about-card" onClick={() => onNavigate('contributors')}>
            <Users size={20} /><h3>Contributors</h3>
            <p>Meet the people who built and maintain this collection. Your name could be here too.</p>
          </button>
          <button className="about-card" onClick={() => onNavigate('contributing')}>
            <Heart size={20} /><h3>Contribute</h3>
            <p>Share your notes and add your name to the contributors list. Learn how to get started.</p>
          </button>
        </div>
      </section>

      <section className="stats-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">By the numbers</span><h2>Collection stats</h2></div>
        </div>
        <div className="stats-grid">
          <div className="stat-card stat-card-highlight">
            <Eye size={18} />
            <strong>{formatCount(visitors)}</strong>
            <span>Visitors</span>
          </div>
          <div className="stat-card stat-card-highlight">
            <MousePointerClick size={18} />
            <strong>{formatCount(pageViews)}</strong>
            <span>Page visits</span>
          </div>
          <div className="stat-card">
            <FileText size={18} />
            <strong>{formatCount(allFiles.length)}</strong>
            <span>Files shared</span>
          </div>
          <div className="stat-card">
            <Layers size={18} />
            <strong>{subjectsWithNotes}</strong>
            <span>Subjects with notes</span>
          </div>
          <div className="stat-card">
            <HardDrive size={18} />
            <strong>{formatSize(totalBytes)}</strong>
            <span>Of study material</span>
          </div>
        </div>
      </section>
    </>
  );
}
