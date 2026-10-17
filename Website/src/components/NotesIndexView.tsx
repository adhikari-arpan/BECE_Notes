import { ArrowLeft, ArrowRight, FileStack, Upload } from 'lucide-react';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';
import { SubjectSearch } from '@/components/SubjectSearch';
import { SemesterCards } from '@/components/SemesterCards';
import { useStructure } from '@/content/structure';
import './PastQuestionsIndexView.css';

/**
 * /notes: every semester's notes in one place (the same cards and subject search as the home page),
 * laid out like /past-questions. Follows the curriculum switch.
 */
export function NotesIndexView() {
  const structure = useStructure();
  return (
    <>
      <section className="semester-page-header section-wrap pqi-header">
        <div className="pqi-hero">
          <Link to="/" className="pqi-home" aria-label="Home" data-tip="Home"><ArrowLeft size={20} /></Link>
          <h1 className="pqi-title">Semester <em>Notes</em></h1>
          <span className="pqi-kicker">Pokhara University · BE Computer Engineering</span>
          <p className="pqi-lead">Lecture notes, handwritten notes, lab works and syllabus for every semester, sorted by subject.</p>
        </div>
        <div className="structure-bar"><StructureToggle /></div>
      </section>

      <section className="section-wrap pqi-page">
        <SubjectSearch structure={structure}>
          <SemesterCards structure={structure} />
        </SubjectSearch>

        <div className="pqi-cta">
          <FileStack size={20} />
          <p><strong>Practising for exams?</strong> Past PU papers for every semester, sorted by subject and year.</p>
          <Link to="/past-questions" className="pqi-cta-link">Past questions <ArrowRight size={14} /></Link>
        </div>
        <div className="pqi-cta">
          <Upload size={20} />
          <p><strong>Have notes to share?</strong> Add them so the next batch can study from them too.</p>
          <Link to="/contributing" className="pqi-cta-link">How to contribute <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}
