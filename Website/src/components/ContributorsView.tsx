import { ArrowLeft } from 'lucide-react';
import { contributors } from '@/content/contributors';

interface ContributorsViewProps {
  onBack: () => void;
  onContributing: () => void;
}

export function ContributorsView({ onBack, onContributing }: ContributorsViewProps) {
  return (
    <>
      <section className="semester-page-header section-wrap">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to home
        </button>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">The people behind it</span>
            <h2>Contributors</h2>
          </div>
        </div>
      </section>

      <section className="contributors-section section-wrap">
        <div className="contributors-list">
          {contributors.map((c, i) => (
            <div key={i} className={`contributor-card ${i === 0 ? 'contributor-card-lead' : ''}`}>
              <div className="contributor-avatar">{c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div className="contributor-info">
                <div className="contributor-name-row">
                  <strong>{c.name}</strong>
                  {i === 0 && <span className="lead-badge">Founder</span>}
                </div>
                <span className="contributor-role">{c.role}</span>
                <span className="contributor-semester">{c.semester}</span>
                <div className="contributor-subjects">
                  {c.subjects.map((s, j) => <span key={j} className="contributor-tag">{s}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="contribute-cta">
          <h3>Your name could be here</h3>
          <p>Contribute 10 or more relevant study note files and your name joins the list of people helping fellow BECE students. Every contribution, however small, still shows up among the contributors on GitHub.</p>
          <button className="cta-button" onClick={onContributing}>See contributing guidelines</button>
        </div>
      </section>
    </>
  );
}
