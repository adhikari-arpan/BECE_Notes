import { useState } from 'react';
import { ArrowLeft, ArrowRight, Calculator, GraduationCap, ScrollText } from 'lucide-react';
import { Link } from '@/components/Link';
import { ChiyaGlass } from '@/components/ChiyaSipper';
import { semesterPath, semesters } from '@/content/notes';
import './NotFoundView.css';

/** A different excuse each time someone gets lost. */
const EXCUSES = [
  'Maybe it’s still stuck in the college printer queue.',
  'It probably bunked class. Attendance: below 80%.',
  'The notes for this page were never shared on the class group.',
  'Even the topper couldn’t find this one.',
  'It’s in the syllabus, but no one has covered it yet.',
  'This page is “Not Qualified” for the semester-end exam.',
];

const QUICK_LINKS = [
  { to: '/syllabus', icon: ScrollText, title: 'Syllabus', text: 'Every semester’s courses, codes and credits' },
  { to: '/cgpa-calculator', icon: Calculator, title: 'CGPA Calculator', text: 'Work out your SGPA and CGPA' },
  { to: '/pu-grading-system', icon: GraduationCap, title: 'PU Grading Guide', text: 'Marks, grades, SGPA and CGPA rules' },
];

export function NotFoundView() {
  const [excuse] = useState(() => EXCUSES[Math.floor(Math.random() * EXCUSES.length)]);

  return (
    <section className="not-found section-wrap">
      <div className="not-found-code" aria-label="404">
        <span>4</span>
        <svg className="not-found-glass" viewBox="-16 -26 32 40" aria-hidden="true">
          <ChiyaGlass />
        </svg>
        <span>4</span>
      </div>

      <span className="section-kicker">Page not found</span>
      <h2>This page went on a chiya break</h2>
      <p className="not-found-lead">
        The page you’re looking for doesn’t exist, or the notes were moved. <em>{excuse}</em>
      </p>
      <Link to="/" className="cta-button not-found-home"><ArrowLeft size={16} /> Back to home</Link>

      <div className="not-found-block">
        <span className="not-found-label">Jump to a semester</span>
        <div className="not-found-semesters">
          {semesters.map((s) => (
            <Link key={s.id} to={semesterPath(s)}>{s.label.replace('Semester ', 'Sem ')}</Link>
          ))}
        </div>
      </div>

      <div className="not-found-block">
        <span className="not-found-label">Or try one of these</span>
        <div className="not-found-links">
          {QUICK_LINKS.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="not-found-link">
              <span className="not-found-link-icon"><Icon size={18} /></span>
              <span><strong>{title}</strong><small>{text}</small></span>
              <ArrowRight size={15} className="not-found-link-go" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
