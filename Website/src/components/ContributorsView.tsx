import { ArrowLeft, BookOpen, FileStack } from 'lucide-react';
import { Link } from '@/components/Link';
import { FounderCard } from '@/components/FounderCard';
import { FOUNDER, filesAdded, noteContributors, pastQuestionContributors, type Contributor } from '@/content/contributors';

/** A small box: photo or initials, name, and how many files they added. */
function ContributorChip({ c, count, word }: { c: Contributor; count: number; word: string }) {
  const photo = c.photoSmall ?? c.photo;
  return (
    <li className="contributor-chip">
      {photo ? (
        <img src={`${import.meta.env.BASE_URL}${photo}`} alt="" loading="lazy" />
      ) : (
        <span className="contributor-chip-initials" aria-hidden="true">{c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
      )}
      <span className="contributor-chip-text">
        <strong>{c.name}</strong>
        <small>{count} {word}{count === 1 ? '' : 's'}</small>
      </span>
    </li>
  );
}

/** One list (notes or past questions): everyone except the founder, most files first. */
function ContributorList({ title, icon, people, count, word, empty }: {
  title: string;
  icon: React.ReactNode;
  people: Contributor[];
  count: (c: Contributor) => number;
  word: string;
  empty: React.ReactNode;
}) {
  const others = people.filter((c) => c !== FOUNDER);
  return (
    <div className="contributors-group">
      <h3 className="contributors-heading">{icon} {title}</h3>
      {others.length ? (
        <ul className="contributor-chips">
          {others.map((c) => <ContributorChip key={c.name} c={c} count={count(c)} word={word} />)}
        </ul>
      ) : (
        <p className="contributors-empty">{empty}</p>
      )}
    </div>
  );
}

export function ContributorsView() {
  return (
    <>
      <section className="semester-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">The people behind it</span>
            <h2>Contributors</h2>
          </div>
        </div>
      </section>

      <section className="contributors-section section-wrap">
        <div className="contributors-founder"><FounderCard /></div>

        <ContributorList
          title="Contributors of notes"
          icon={<BookOpen size={18} />}
          people={noteContributors}
          count={(c) => filesAdded(c).notes}
          word="note file"
          empty={<>No other note contributors yet. <Link to="/contributing">Share your notes</Link> and you’ll be listed here.</>}
        />
        <ContributorList
          title="Contributors of past questions"
          icon={<FileStack size={18} />}
          people={pastQuestionContributors}
          count={(c) => filesAdded(c).pastQuestions}
          word="past paper"
          empty={<>No other past paper contributors yet. <Link to="/past-questions">Have a past paper? Add it</Link> and you’ll be listed here.</>}
        />

        <div className="contribute-cta">
          <h3>Your name could be here</h3>
          <p>Contribute 10 or more relevant files (notes or past question papers) and your name joins the list of people helping fellow BECE students. Every contribution, however small, still shows up among the contributors on GitHub.</p>
          <Link to="/contributing" className="cta-button">See contributing guidelines</Link>
        </div>
      </section>
    </>
  );
}
