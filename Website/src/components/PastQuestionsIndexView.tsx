import { useState } from 'react';
import { ArrowRight, FileUp, Search, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { PageHero } from '@/components/PageHero';
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
      return { semester, papers, subjects };
    });

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
        <PageHero
          title={<>Past <em>Questions</em></>}
          kicker="Pokhara University · BE Computer Engineering"
          lead="PU exam papers and college assessments for every semester, sorted by subject and year."
        />
        <div className="structure-bar"><StructureToggle /></div>
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

        <div className="semester-cards pqi-grid" style={words.length ? { display: 'none' } : undefined}>
          {cards.map(({ semester, papers, subjects }) => {
            const covered = subjects.filter((x) => x.files.length).length;
            return (
              <Link key={semester.id} to={pastQuestionsPath(semester)} className={`semester-card ${papers ? '' : 'semester-card-empty'}`}>
                <span className="semester-card-glyph" data-glyph={semester.badge} aria-hidden="true" />
                <span className="semester-card-top">
                  <span className="semester-card-badge">{semester.badge}</span>
                  <span className="semester-card-year">{semester.year}</span>
                </span>
                <strong className="semester-card-name">{semester.label}</strong>
                <span className="semester-card-progress">{papers ? `${covered}/${subjects.length} subjects with papers` : 'Help collect papers'}</span>
                <span className="semester-card-foot">
                  <span className="semester-card-meta">{papers > 0 && <span>{plural(papers, 'paper')}</span>}</span>
                  <span className="semester-card-go"><ArrowRight size={15} /></span>
                </span>
              </Link>
            );
          })}
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
