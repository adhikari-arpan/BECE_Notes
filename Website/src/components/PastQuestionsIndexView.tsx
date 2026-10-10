import { ArrowLeft, ArrowRight, FileStack, FileUp } from 'lucide-react';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';
import { pastQuestionCollections, pastQuestionsPath, plural } from '@/content/notes';
import { pastQuestionSubjects } from '@/content/pastQuestions';
import { useStructure } from '@/content/structure';
import './PastQuestionsIndexView.css';

/**
 * /past-questions: every semester's Past Question Collection in one place, with how many papers
 * and subjects each has, so students can jump to theirs. Follows the curriculum switch.
 */
export function PastQuestionsIndexView() {
  const structure = useStructure();
  const cards = pastQuestionCollections
    .map(({ semester, files }) => {
      const subjects = pastQuestionSubjects(semester, structure);
      // In the earlier order the collection's own files also include its College Assessments.
      const papers = structure === 'pre2025' ? files.length : subjects.reduce((a, s) => a + s.files.length, 0);
      return { semester, papers, covered: subjects.filter((s) => s.files.length).length, total: subjects.length };
    });
  const totalPapers = cards.reduce((a, c) => a + c.papers, 0);

  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to="/" className="back-button"><ArrowLeft size={16} /> Back to home</Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Pokhara University · BE Computer Engineering</span>
            <h2>Past Questions</h2>
          </div>
          <span className="subject-count-pill">8 semesters · {plural(totalPapers, 'paper')}</span>
        </div>
        <p className="pqi-lead">
          Past Pokhara University exam papers and college assessments for every semester, sorted by subject and year.
          Pick your semester to start practising.
        </p>
        <div className="structure-bar"><StructureToggle /></div>
      </section>

      <section className="section-wrap pqi-page">
        <div className="pqi-grid">
          {cards.map(({ semester, papers, covered, total }) => (
            <Link key={semester.id} to={pastQuestionsPath(semester)} className={`pqi-card ${papers ? '' : 'is-empty'}`}>
              <span className="pqi-card-top">
                <span className="semester-card-badge">{semester.badge}</span>
                <span className="pqi-icon"><FileStack size={18} /></span>
              </span>
              <strong>{semester.label}</strong>
              <span className="pqi-year">{semester.year}</span>
              <span className="pqi-foot">
                <span>{papers ? plural(papers, 'paper') : 'Help collect papers'}{total ? ` · ${covered}/${total} subjects` : ''}</span>
                <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>

        <div className="pqi-cta">
          <FileUp size={20} />
          <p><strong>Have a past paper?</strong> The collection is still growing. Add it so the next batch can practise too.</p>
          <Link to="/contributing#past-question-papers" className="pqi-cta-link">How to send papers <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}
