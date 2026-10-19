import { ArrowLeft, ArrowRight, BookOpen, BookOpenCheck, ClipboardCheck, FileStack, Target } from 'lucide-react';
import { Link } from '@/components/Link';
import { AccentLast, PageHero } from '@/components/PageHero';
import { pastQuestionsFor, pastQuestionsPath, semesters, subjectPath } from '@/content/notes';
import { studyGuidePath, studyGuides, type StudyGuideEntry } from '@/content/studyGuides';
import './StudyGuideView.css';

/** /study-guides: every subject's guide, grouped by semester. */
export function StudyGuidesIndexView() {
  const groups = semesters
    .map((semester) => ({ semester, guides: studyGuides.filter((g) => g.semester.id === semester.id) }))
    .filter((g) => g.guides.length);
  return (
    <>
      <section className="semester-page-header section-wrap pqi-header">
        <PageHero
          title={<>Study <em>Guides</em></>}
          kicker="Pokhara University · BE Computer Engineering"
          lead="How to study each subject: the topics worth extra time, how to practise, and how to prepare for the exam."
        />
      </section>
      <section className="section-wrap sg-index">
        {groups.map(({ semester, guides }) => (
          <div key={semester.id} className="sg-group">
            <h2>{semester.label}</h2>
            <div className="sg-list">
              {guides.map((g) => (
                <Link key={g.slug} to={studyGuidePath(g)} className="sg-item">
                  <span>{g.subject.name}</span>
                  {g.subject.kind === 'course' && !g.subject.code.startsWith('ELEC') && <small>{g.subject.code}</small>}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

/** /study-guides/<subject>: one subject's guide, written as a short article. */
export function StudyGuideView({ entry }: { entry: StudyGuideEntry }) {
  const { subject, semester } = entry;
  const { guide } = subject;
  const i = studyGuides.indexOf(entry);
  const prev = studyGuides[i - 1];
  const next = studyGuides[i + 1];
  return (
    <>
      <section className="semester-page-header content-page-header section-wrap pqi-header">
        <PageHero
          back={studyGuidePath()}
          backLabel="All study guides"
          title={<span className={subject.name.length > 26 ? 'sg-title-long' : undefined}><AccentLast text={subject.name} /></span>}
          kicker={`Study guide · ${semester.label}${subject.kind === 'course' && !subject.code.startsWith('ELEC') ? ` · ${subject.code}` : ''}`}
          lead="Key topics, how to study it, and how to prepare for the exam."
        />
      </section>

      <article className="content-page section-wrap sg-article">
        {subject.description && (
          <div className="content-page-section">
            <h3><BookOpen size={17} /> What it covers</h3>
            <p className="content-page-lead">{subject.description}</p>
          </div>
        )}
        <div className="content-page-section">
          <h3><Target size={17} /> Topics worth extra time</h3>
          <ol>{guide.focus.map((t) => <li key={t}>{t}</li>)}</ol>
        </div>
        <div className="content-page-section">
          <h3><BookOpenCheck size={17} /> How to study it</h3>
          <p>{guide.study}</p>
        </div>
        <div className="content-page-section">
          <h3><ClipboardCheck size={17} /> In the exam</h3>
          <p>{guide.exam}</p>
        </div>

        <div className="sg-links">
          <Link to={subjectPath(semester, subject)}><BookOpen size={15} /> {subject.name} notes</Link>
          {pastQuestionsFor(semester) && (
            <Link to={`${pastQuestionsPath(semester)}?subject=${encodeURIComponent(subject.name)}`}><FileStack size={15} /> Past papers</Link>
          )}
        </div>

        <nav className="sg-pager" aria-label="More study guides">
          {prev ? <Link to={studyGuidePath(prev)} className="sg-prev"><ArrowLeft size={14} /> <span><small>Previous</small>{prev.subject.name}</span></Link> : <span />}
          {next && <Link to={studyGuidePath(next)} className="sg-next"><span><small>Next</small>{next.subject.name}</span> <ArrowRight size={14} /></Link>}
        </nav>
      </article>
    </>
  );
}
