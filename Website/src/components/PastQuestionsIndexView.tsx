import { useState } from 'react';
import { ArrowLeft, ArrowRight, FileStack, FileUp, Search, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { StructureToggle } from '@/components/StructureToggle';
import { normalizeName, pastQuestionCollections, pastQuestionsPath, plural } from '@/content/notes';
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

  // Search by subject: name, folder or short form ("dsa", "data struct", "AI"), across every semester.
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? pastQuestionCollections.flatMap(({ semester }) =>
    pastQuestionSubjects(semester, structure)
      .filter((s) => {
        const hay = `${s.name} ${s.folder} ${s.short ?? ''}`.toLowerCase();
        const compact = normalizeName(hay);
        return words.every((w) => hay.includes(w) || compact.includes(normalizeName(w)));
      })
      .map((s) => ({ ...s, semester }))) : [];

  return (
    <>
      <section className="semester-page-header section-wrap pqi-header">
        <Link to="/" className="back-button"><ArrowLeft size={16} /> Back to home</Link>
        <div className="pqi-hero">
          <div>
            <span className="section-kicker">Pokhara University · BE Computer Engineering</span>
            <h1 className="pqi-title">Past <em>Questions</em></h1>
          </div>
        </div>
        <p className="pqi-lead">
          PU exam papers and college assessments for every semester, sorted by subject and year.
        </p>
        <div className="structure-bar">
          <StructureToggle />
          <span className="subject-count-pill">{cards.length} semesters · {plural(totalPapers, 'paper')}</span>
        </div>
      </section>

      <section className="section-wrap pqi-page">
        <label className="pqi-search">
          <Search size={18} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by subject, e.g. DSA, Calculus, Machine Learning" aria-label="Search past questions by subject" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        </label>

        {words.length > 0 && (
          <div className="pqi-results" aria-live="polite">
            {results.length ? results.map((r) => (
              <Link key={`${r.semester.id}:${r.folder}`} to={`${pastQuestionsPath(r.semester)}?subject=${encodeURIComponent(r.folder)}`} className={`pqi-result ${r.files.length ? '' : 'is-empty'}`}>
                <span className="pqi-result-name"><strong>{r.name}</strong>{r.short && <b>{r.short}</b>}</span>
                <span className="pqi-result-sem">{r.semester.label}{r.home !== r.semester ? ` · filed in ${r.home.label}` : ''}</span>
                <span className="pqi-result-count">{r.files.length ? plural(r.files.length, 'paper') : 'No papers yet'}</span>
                <ArrowRight size={15} />
              </Link>
            )) : <p className="pqi-noresult">No subject matches “{query}”. Try a shorter word or a short form like “DSA”.</p>}
          </div>
        )}

        <div className="pqi-grid" style={words.length ? { display: 'none' } : undefined}>
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
