import {
  ArrowRight,
  Users,
  CheckCircle2,
  Heart,
  Eye,
  MousePointerClick,
  FileText,
  Layers,
  HardDrive,
} from 'lucide-react';
import { allFiles, formatSize, isSyllabus, plural, semesters } from '@/content/notes';
import { formatCount, useSiteStats } from '@/content/visits';
import { CountUp } from '@/components/CountUp';
import { Logo } from '@/components/Logo';
import { contributors } from '@/content/contributors';

interface HomeViewProps {
  onSelectSemester: (id: string) => void;
  onNavigate: (page: 'about' | 'contributors' | 'contributing') => void;
}

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id));
const subjectsWithNotes = semesters.flatMap((s) => s.subjects).filter((s) => !isSyllabus(s) && s.files.length > 0).length;
/** Every subject in the Semester I–VIII curriculum, whether or not notes exist for it yet. */
const founder = contributors[0];
const totalSubjects = courseSemesters.flatMap((s) => s.subjects).filter((s) => s.kind === 'course').length;
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
            <div><strong><CountUp value={totalSubjects} /></strong><span>Subjects</span></div>
            <div><strong><CountUp value={allFiles.length} /></strong><span>Note Files</span></div>
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
        <div className="semester-cards">
          {semesters.map((semester) => {
            const subjects = semester.subjects.filter((s) => !isSyllabus(s));
            const withNotes = subjects.filter((s) => s.files.length > 0).length;
            const files = subjects.reduce((sum, s) => sum + s.files.length, 0);
            const credits = subjects.reduce((sum, s) => sum + (s.kind === 'course' ? s.credits ?? 0 : 0), 0);
            return (
              <button
                key={semester.id}
                className={`semester-card ${files === 0 ? 'semester-card-empty' : ''}`}
                onClick={() => onSelectSemester(semester.id)}
              >
                <span className="semester-card-glyph" aria-hidden="true">{semester.badge}</span>
                <span className="semester-card-top">
                  <span className="semester-card-badge">{semester.badge}</span>
                  <span className="semester-card-year">{semester.year}</span>
                </span>
                <strong className="semester-card-name">{semester.label}</strong>
                <span className="semester-card-progress">
                  {files === 0 ? 'Coming soon' : `${withNotes}/${subjects.length} subjects with notes`}
                </span>
                <span className="semester-card-foot">
                  <span className="semester-card-meta">
                    {files > 0 && <span>{plural(files, 'file')}</span>}
                    {credits > 0 && <span>{credits} credits</span>}
                  </span>
                  <span className="semester-card-go"><ArrowRight size={15} /></span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="about-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">The project</span><h2>About the collection</h2></div>
        </div>
        <div className="about-grid">
          <button className="about-card about-card-feature" onClick={() => onNavigate('about')}>
            <span className="about-card-top">
              <Logo className="about-card-logo" />
              <span className="about-card-kicker">Pokhara University · BECE</span>
            </span>
            <h3>About this collection</h3>
            <p>
              A free, semester-wise library of notes for Computer Engineering students at Pokhara University: lecture
              notes, handwritten notes, question collections, lab reports and syllabus, all in one place.
            </p>
            <span className="about-card-facts">
              <span><CheckCircle2 size={14} /> Semester-wise</span>
              <span><CheckCircle2 size={14} /> PU curriculum</span>
              <span><CheckCircle2 size={14} /> Free forever</span>
            </span>
            {founder && (
              <span className="about-card-founder">
                {founder.photo && <img src={`${import.meta.env.BASE_URL}${founder.photo}`} alt="" />}
                <span>
                  <small>Started by</small>
                  <strong>{founder.name}</strong>
                  <em>Nepal College of Information Technology (NCIT)</em>
                </span>
              </span>
            )}
            <span className="about-card-cta">Read the story <ArrowRight size={15} /></span>
          </button>

          <button className="about-card" onClick={() => onNavigate('contributors')}>
            <span className="about-card-top">
              <span className="about-card-icon"><Users size={20} /></span>
            </span>
            <h3>Contributors</h3>
            <p>Meet the people who built and maintain this collection. Your name could be here too.</p>
            <span className="about-card-foot">
              <span className="about-card-pill">{plural(contributors.length, 'contributor')}</span>
              <span className="about-card-go"><ArrowRight size={15} /></span>
            </span>
          </button>

          <button className="about-card about-card-gold" onClick={() => onNavigate('contributing')}>
            <span className="about-card-top">
              <span className="about-card-icon"><Heart size={20} /></span>
            </span>
            <h3>Contribute</h3>
            <p>Share your notes with fellow students. Contribute 10+ note files to get your name on the contributors list.</p>
            <span className="about-card-foot">
              <span className="about-card-pill">How to contribute</span>
              <span className="about-card-go"><ArrowRight size={15} /></span>
            </span>
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
