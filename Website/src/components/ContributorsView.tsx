import { ArrowLeft, Globe, Mail } from 'lucide-react';
import { Link } from '@/components/Link';
import { contributors } from '@/content/contributors';

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
        <div className="contributors-list">
          {contributors.map((c, i) => (
            <div key={i} className={`contributor-card ${i === 0 ? 'contributor-card-lead' : ''}`}>
              {c.photo ? (
                <img className="contributor-avatar contributor-photo" src={`${import.meta.env.BASE_URL}${c.photo}`} alt={c.name} loading="lazy" />
              ) : (
                <div className="contributor-avatar">{c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              )}
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
                {(c.website || c.email) && (
                  <div className="contributor-links">
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer"><Globe size={14} /> {c.website.replace(/^https?:\/\//, '')}</a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`}><Mail size={14} /> {c.email}</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="contribute-cta">
          <h3>Your name could be here</h3>
          <p>Contribute 10 or more relevant study note files and your name joins the list of people helping fellow BECE students. Every contribution, however small, still shows up among the contributors on GitHub.</p>
          <Link to="/contributing" className="cta-button">See contributing guidelines</Link>
        </div>
      </section>
    </>
  );
}
