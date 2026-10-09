import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Coffee,
  Users,
  CheckCircle2,
  Heart,
  Eye,
  MousePointerClick,
  FileText,
  Layers,
  HardDrive,
} from 'lucide-react';
import { allFiles, formatSize, isSyllabus, plural, semesterPath, semesters } from '@/content/notes';
import { COUNTING_SINCE, formatCount, useSiteStats } from '@/content/visits';
import { CountUp } from '@/components/CountUp';
import { Logo } from '@/components/Logo';
import { ChiyaCup, ChiyaUses } from '@/components/TipJar';
import { openTipJar } from '@/content/tipJar';
import { Link } from '@/components/Link';
import { contributors } from '@/content/contributors';
import { semesters2025 } from '@/content/curriculum2025';
import { SITE_FAQS } from '@/content/siteFaq';
import { useStructure } from '@/content/structure';
import { StructureToggle } from '@/components/StructureToggle';

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id));
const subjectsWithNotes = semesters.flatMap((s) => s.subjects).filter((s) => !isSyllabus(s) && s.files.length > 0).length;
/** Every subject in the Semester I–VIII curriculum, whether or not notes exist for it yet. */
const founder = contributors[0];
const totalSubjects = courseSemesters.flatMap((s) => s.subjects).filter((s) => s.kind === 'course').length;
const totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0);

export function HomeView() {
  const { visitors, pageViews, todayVisitors, todayPageViews } = useSiteStats();
  const structure = useStructure();

  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Pokhara University · BECE Notes</div>
          <h1>Your BECE notes,<br /><em>in one place.</em></h1>
          <p className="hero-lede">Free, semester-wise notes for Pokhara University BE Computer Engineering: every lecture note, past question, lab report and syllabus across your BECE journey. Pick a semester to explore its subjects.</p>
          <span className="hero-badge"><BadgeCheck size={15} /> Based on the new PU syllabus</span>
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
        <div className="structure-bar structure-bar-home">
          <StructureToggle />
          <span className="structure-note-inline">
            {structure === '2025'
              ? 'Showing the 2025 order: same subjects and credits, in their new semesters.'
              : 'Joined in 2025 or later? Switch to see your semesters.'}
          </span>
        </div>
        <div className="semester-cards">
          {semesters.map((semester) => {
            const courses2025 = structure === '2025' ? semesters2025.find((s) => String(s.id) === semester.id)?.courses : undefined;
            // In the 2025 view, a semester's numbers come from its 2025 courses (wherever their notes are filed).
            const subjects = courses2025
              ? courses2025.map((c) => c.subject).filter((s): s is NonNullable<typeof s> => !!s)
              : semester.subjects.filter((s) => !isSyllabus(s));
            const withNotes = subjects.filter((s) => s.files.length > 0).length;
            const files = subjects.reduce((sum, s) => sum + s.files.length, 0);
            const credits = courses2025
              ? courses2025.reduce((sum, c) => sum + c.credits, 0)
              : subjects.reduce((sum, s) => sum + (s.kind === 'course' ? s.credits ?? 0 : 0), 0);
            return (
              <Link
                key={semester.id}
                to={semesterPath(semester)}
                className={`semester-card ${files === 0 ? 'semester-card-empty' : ''}`}
              >
                <span className="semester-card-glyph" data-glyph={semester.badge} aria-hidden="true" />
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
              </Link>
            );
          })}
        </div>
      </section>

      <section className="about-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">The project</span><h2>About the collection</h2></div>
        </div>
        <div className="about-grid">
          <Link to="/about" className="about-card about-card-feature">
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
                {founder.photo && <img src={`${import.meta.env.BASE_URL}${founder.photoSmall ?? founder.photo}`} alt="" width={44} height={44} loading="lazy" />}
                <span>
                  <small>Started by</small>
                  <strong>{founder.name}</strong>
                  <em>Nepal College of Information Technology (NCIT)</em>
                </span>
              </span>
            )}
            <span className="about-card-cta">Read the story <ArrowRight size={15} /></span>
          </Link>

          <Link to="/contributors" className="about-card">
            <span className="about-card-top">
              <span className="about-card-icon"><Users size={20} /></span>
            </span>
            <h3>Contributors</h3>
            <p>Meet the people who built and maintain this collection. Your name could be here too.</p>
            <span className="about-card-foot">
              <span className="about-card-pill">{plural(contributors.length, 'contributor')}</span>
              <span className="about-card-go"><ArrowRight size={15} /></span>
            </span>
          </Link>

          <Link to="/contributing" className="about-card about-card-gold">
            <span className="about-card-top">
              <span className="about-card-icon"><Heart size={20} /></span>
            </span>
            <h3>Contribute</h3>
            <p>Share your notes with fellow students. Contribute 10+ note files to get your name on the contributors list.</p>
            <span className="about-card-foot">
              <span className="about-card-pill">How to contribute</span>
              <span className="about-card-go"><ArrowRight size={15} /></span>
            </span>
          </Link>
        </div>
      </section>

      <section className="stats-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">By the numbers</span><h2>Collection stats</h2></div>
        </div>
        {/* Visits: one panel, today (Nepal time) next to all time. */}
        <div className="visits-panel">
          <div className="visits-group visits-group-today">
            <span className="visits-label"><span className="visits-label-title"><span className="visits-live" aria-hidden="true" /> Today</span><small>Nepal time</small></span>
            <div className="visits-metrics">
              <div><strong>{formatCount(todayVisitors)}</strong><span><Eye size={13} /> Visitors</span></div>
              <div><strong>{formatCount(todayPageViews)}</strong><span><MousePointerClick size={13} /> Page visits</span></div>
            </div>
          </div>
          <div className="visits-group">
            <span className="visits-label visits-label-hint" tabIndex={0} aria-describedby="visits-since">
              <span className="visits-label-title"><CalendarDays size={13} /> All time</span><small>Lifetime</small>
              <span className="visits-tip" id="visits-since" role="tooltip">
                Counting from <strong>{COUNTING_SINCE}</strong>
              </span>
            </span>
            <div className="visits-metrics">
              <div><strong>{formatCount(visitors)}</strong><span><Eye size={13} /> Visitors</span></div>
              <div><strong>{formatCount(pageViews)}</strong><span><MousePointerClick size={13} /> Page visits</span></div>
            </div>
          </div>
        </div>
        <div className="stats-grid stats-grid-library">
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

      <section className="home-faq-section section-wrap">
        <div className="section-heading">
          <div><span className="section-kicker">Questions</span><h2>Frequently asked</h2></div>
        </div>
        <div className="guide-faq">
          {SITE_FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="chiya-banner-section section-wrap">
        <div className="chiya-banner">
          <ChiyaCup size={76} />
          <div className="chiya-banner-text">
            <span className="section-kicker">Support the project</span>
            <h3>Did these notes help you pass?</h3>
            <p>BECE Vault is free for every student. If it saved you time before an exam, buy me a chiya — it keeps the library free, maintained and regularly updated.</p>
            <ChiyaUses compact />
          </div>
          <button className="chiya-cta" onClick={openTipJar}><Coffee size={16} /> Buy me a Chiya</button>
        </div>
      </section>
    </>
  );
}
