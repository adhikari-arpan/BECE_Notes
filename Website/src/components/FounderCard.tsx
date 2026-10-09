import { ArrowRight, BookOpen, FileStack, Globe, Mail } from 'lucide-react';
import { Link } from '@/components/Link';
import { FOUNDER, filesAdded } from '@/content/contributors';

/** A short introduction of the founder for the About page: photo, name and role, and a link to everyone involved. */
export function FounderIntro() {
  const c = FOUNDER;
  return (
    <div className="founder-intro">
      {c.photo && <img src={`${import.meta.env.BASE_URL}${c.photo}`} alt={c.name} loading="lazy" />}
      <div className="founder-intro-text">
        <span className="founder-intro-kicker">Started by</span>
        <strong>{c.name}</strong>
        <span>{c.role} · Computer Engineering, NCIT</span>
        <span className="founder-intro-links">
          {c.website && <a href={c.website} target="_blank" rel="noreferrer"><Globe size={13} /> Portfolio</a>}
          <Link to="/contributors">All contributors <ArrowRight size={13} /></Link>
        </span>
      </div>
    </div>
  );
}

/** The founder's card (photo, role, what they look after, links and files added), on the Contributors page. */
export function FounderCard() {
  const c = FOUNDER;
  const files = filesAdded(c);
  return (
    <div className="contributor-card contributor-card-lead">
      {c.photo ? (
        <img className="contributor-avatar contributor-photo" src={`${import.meta.env.BASE_URL}${c.photo}`} alt={c.name} loading="lazy" />
      ) : (
        <div className="contributor-avatar">{c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
      )}
      <div className="contributor-info">
        <div className="contributor-name-row">
          <strong>{c.name}</strong>
          <span className="lead-badge">Founder</span>
        </div>
        <span className="contributor-role">{c.role} · started BECE Vault</span>
        <span className="contributor-semester">{c.semester}</span>
        <div className="contributor-subjects">
          {(c.subjects ?? []).map((s) => <span key={s} className="contributor-tag">{s}</span>)}
        </div>
        {(files.notes > 0 || files.pastQuestions > 0) && (
          <div className="founder-stats">
            <span><BookOpen size={14} /><strong>{files.notes.toLocaleString('en-US')}</strong> note files</span>
            <span><FileStack size={14} /><strong>{files.pastQuestions.toLocaleString('en-US')}</strong> past papers</span>
          </div>
        )}
        {(c.website || c.email) && (
          <div className="contributor-links">
            {c.website && <a href={c.website} target="_blank" rel="noreferrer"><Globe size={14} /> {c.website.replace(/^https?:\/\//, '')}</a>}
            {c.email && <a href={`mailto:${c.email}`}><Mail size={14} /> {c.email}</a>}
          </div>
        )}
      </div>
    </div>
  );
}
