import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/components/Link';
import './PageHero.css';

interface BackProps {
  /** Where the arrow goes (home by default). */
  to?: string;
  /** Shown as the arrow's tooltip, e.g. "Home" or "All semesters". */
  label?: string;
  /** Not positioned inside a hero: sits in the normal flow (e.g. above the subject box). */
  inline?: boolean;
}

/** The round back arrow with a tooltip, used at the top of every page. */
export function BackArrow({ to = '/', label = 'Home', inline = false }: BackProps) {
  return (
    <Link to={to} className={`pqi-home${inline ? ' pqi-home-inline' : ''}`} aria-label={label === 'Home' ? 'Home' : `Back to ${label}`} data-tip={label}>
      <ArrowLeft size={20} />
    </Link>
  );
}

interface Props {
  title: ReactNode;
  kicker: ReactNode;
  lead?: ReactNode;
  back?: string;
  backLabel?: string;
  /** Shown beside the title (e.g. a logo). */
  logo?: ReactNode;
}

/** Page heading: back arrow on the left, a centred title with a gold accent, a small kicker and a one-line lead. */
export function PageHero({ title, kicker, lead, back, backLabel, logo }: Props) {
  return (
    <div className="pqi-hero">
      <BackArrow to={back} label={backLabel} />
      {logo ? (
        <div className="pqi-title-row">{logo}<h1 className="pqi-title">{title}</h1></div>
      ) : (
        <h1 className="pqi-title">{title}</h1>
      )}
      <span className="pqi-kicker">{kicker}</span>
      {lead && <p className="pqi-lead">{lead}</p>}
    </div>
  );
}

/** "Semester III" → Semester <em>III</em>: the last word gets the gold accent. */
export function AccentLast({ text }: { text: string }) {
  const i = text.lastIndexOf(' ');
  return i < 0 ? <em>{text}</em> : <>{text.slice(0, i + 1)}<em>{text.slice(i + 1)}</em></>;
}
