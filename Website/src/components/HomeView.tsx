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
  FileStack,
  MessageSquareHeart,
  ScrollText,
  Calculator,
  GraduationCap,
} from 'lucide-react';
import { allFiles, isSyllabus, pastQuestionCollections, plural, semesters } from '@/content/notes';
import { COUNTING_SINCE, useSiteStats } from '@/content/visits';
import { CountUp } from '@/components/CountUp';
import { Logo } from '@/components/Logo';
import { ChiyaCup, ChiyaUses } from '@/components/TipJar';
import { openTipJar } from '@/content/tipJar';
import { Link } from '@/components/Link';
import { contributors } from '@/content/contributors';
import { SITE_FAQS } from '@/content/siteFaq';

const courseSemesters = semesters.filter((s) => /^\d+$/.test(s.id));
const subjectsWithNotes = semesters.flatMap((s) => s.subjects).filter((s) => !isSyllabus(s) && s.files.length > 0).length;
/** Every subject in the Semester I–VIII curriculum, whether or not notes exist for it yet. */
const founder = contributors[0];
const totalSubjects = courseSemesters.flatMap((s) => s.subjects).filter((s) => s.kind === 'course').length;
const totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0);
/** Past exam and assessment papers across every semester's Past Question Collection. */
const questionPapers = pastQuestionCollections.reduce((sum, c) => sum + c.files.length, 0);
/** Year (and term) of every paper: `2024_Spring_AG.pdf`, or a `2026_College_Assessments` folder. */
const paperDates = pastQuestionCollections.flatMap((c) => c.files).flatMap((f) => {
  const exam = /^(\d{4})_(Spring|Fall)_/i.exec(f.name);
  if (exam) return [{ year: Number(exam[1]), term: exam[2][0].toUpperCase() + exam[2].slice(1).toLowerCase() }];
  const assessment = /(?:^|\/)(\d{4})_College_Assessments?(?:\/|$)/i.exec(f.folder);
  return assessment ? [{ year: Number(assessment[1]), term: 'Assessment' }] : [];
});
/** The newest paper on the site, shown on the home page's past-questions thumbnail (Fall comes after Spring). */
const TERM_ORDER: Record<string, number> = { Assessment: 0, Spring: 1, Fall: 2 };
const latestPaper = paperDates.reduce<{ year: number; term: string } | null>(
  (best, d) => (!best || d.year > best.year || (d.year === best.year && TERM_ORDER[d.term] > TERM_ORDER[best.term]) ? d : best),
  null,
);
const firstPaperYear = paperDates.length ? Math.min(...paperDates.map((d) => d.year)) : null;
/** Total size split into a number that can count up and its unit, matching formatSize (e.g. 3.1 + " GB"). */
const [sizeValue, sizeUnit, sizeDecimals] = totalBytes >= 1024 ** 3
  ? [Math.round((totalBytes / 1024 ** 3) * 10) / 10, ' GB', 1]
  : [Math.round((totalBytes / 1024 ** 2) * 10) / 10, ' MB', 1];

export function HomeView() {
  const { visitors, pageViews, todayVisitors, todayPageViews } = useSiteStats();

  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> <Link to="/pokhara-university" className="eyebrow-link" title="About Pokhara University">Pokhara University</Link> · BECE</div>
          <h1>Your BECE notes,<br /><em>in one place.</em></h1>
          <p className="hero-lede">Free, semester-wise notes for Pokhara University BE Computer Engineering: every lecture note, past question, lab report and syllabus across your BECE journey. Pick a semester to explore its subjects.</p>
          <Link to="/syllabus" className="hero-badge" title="See the PU BE Computer Engineering syllabus"><BadgeCheck size={15} /> Based on the new PU syllabus <ArrowRight size={13} className="hero-badge-arrow" /></Link>
          <div className="hero-stats">
            <div><strong><CountUp value={courseSemesters.length} pad={2} /></strong><span>Semesters</span></div>
            <div><strong><CountUp value={totalSubjects} /></strong><span>Subjects</span></div>
            <div><strong><CountUp value={allFiles.length} /></strong><span>Note Files</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-card hero-card-back"><span>BECE VAULT</span><ul className="hero-card-list"><li>Notes</li><li>Past questions</li><li>Syllabus</li><li>Labs</li></ul><b>Study smarter.</b></div>
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
          <div><span className="section-kicker">Start here</span><h2>What are you looking for?</h2></div>
        </div>
        {/* Two "stacks of paper" that fan out on hover, each opening its own page; the other tools as plain links. */}
        <div className="shelf">
          <Link to="/notes" className="shelf-item">
            <span className="shelf-stack" aria-hidden="true">
              <span className="sheet sheet-3" />
              <span className="sheet sheet-2" />
              <span className="sheet sheet-1">
                <em>Unit 3</em>
                <i /><i /><i /><i className="short" />
                <b>Handwritten</b>
              </span>
            </span>
            <span className="shelf-text">
              <span className="section-kicker">{courseSemesters.length} semesters · {allFiles.length.toLocaleString('en-US')} files</span>
              <strong>Semester-Wise <em>Notes</em></strong>
              <span className="shelf-desc">Lecture notes, handwritten notes, lab works and syllabus, subject by subject.</span>
              <span className="shelf-cta">Browse notes <ArrowRight size={15} /></span>
            </span>
          </Link>
          <Link to="/past-questions" className="shelf-item shelf-papers">
            <span className="shelf-stack" aria-hidden="true">
              <span className="sheet sheet-3" />
              <span className="sheet sheet-2" />
              <span className="sheet sheet-1">
                <em>Pokhara University</em>
                {latestPaper && <span className="sheet-tags"><u>{latestPaper.year}</u><u>{latestPaper.term}</u></span>}
                <i /><i /><i className="short" />
                <b>Full marks 100</b>
              </span>
            </span>
            <span className="shelf-text">
              <span className="section-kicker">{firstPaperYear && latestPaper ? `${firstPaperYear} → ${latestPaper.year} · ` : ''}{questionPapers.toLocaleString('en-US')} papers</span>
              <strong>Past <em>Questions</em></strong>
              <span className="shelf-desc">PU exam papers and college assessments, sorted by subject and year.</span>
              <span className="shelf-cta">Practise papers <ArrowRight size={15} /></span>
            </span>
          </Link>
        </div>
        <p className="shelf-more">
          Also here:
          <Link to="/syllabus"><ScrollText size={14} /> Syllabus</Link>
          <Link to="/cgpa-calculator"><Calculator size={14} /> CGPA Calculator</Link>
          <Link to="/pu-grading-system"><GraduationCap size={14} /> Grading guide</Link>
        </p>
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
              <div><strong><CountUp value={todayVisitors} durationMs={1100} whenVisible /></strong><span><Eye size={13} /> Visitors</span></div>
              <div><strong><CountUp value={todayPageViews} durationMs={1100} whenVisible /></strong><span><MousePointerClick size={13} /> Page visits</span></div>
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
              <div><strong><CountUp value={visitors} durationMs={1100} whenVisible /></strong><span><Eye size={13} /> Visitors</span></div>
              <div><strong><CountUp value={pageViews} durationMs={1100} whenVisible /></strong><span><MousePointerClick size={13} /> Page visits</span></div>
            </div>
          </div>
        </div>
        <div className="stats-grid stats-grid-library">
          <div className="stat-card">
            <FileText size={18} />
            <strong><CountUp value={allFiles.length} durationMs={1100} whenVisible /></strong>
            <span>Note files</span>
          </div>
          <Link to="/past-questions" className="stat-card stat-card-link">
            <FileStack size={18} />
            <strong><CountUp value={questionPapers} durationMs={1100} whenVisible /></strong>
            <span>Past question papers</span>
          </Link>
          <div className="stat-card">
            <Layers size={18} />
            <strong><CountUp value={subjectsWithNotes} durationMs={1100} whenVisible /></strong>
            <span>Subjects with notes</span>
          </div>
          <div className="stat-card">
            <HardDrive size={18} />
            <strong><CountUp value={sizeValue} decimals={sizeDecimals} suffix={sizeUnit} durationMs={1100} whenVisible /></strong>
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

      <section className="feedback-strip-section section-wrap">
        <Link to="/feedback" className="feedback-strip">
          <span className="feedback-strip-icon"><MessageSquareHeart size={20} /></span>
          <span className="feedback-strip-text">
            <strong>Spotted a mistake or have an idea?</strong>
            <span>Tell us what to fix or add. It takes a minute, no email needed.</span>
          </span>
          <span className="feedback-strip-cta">Give feedback <ArrowRight size={15} /></span>
        </Link>
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
