import { useState, type ReactNode } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { Link } from '@/components/Link';
import { isSyllabus, normalizeName, plural, semesters, subjectPath, type Semester, type Subject } from '@/content/notes';
import { semesters2025 } from '@/content/curriculum2025';
import type { Structure } from '@/content/structure';

const FILLER = new Set(['and', 'of', 'in', 'with', 'the', 'to', 'for', '&']);
/** "Data Structure & Algorithm" → "dsa", so short forms people actually type match. */
const initials = (name: string) => name.split(/[\s&/-]+/).filter((w) => w && !FILLER.has(w.toLowerCase())).map((w) => w[0]).join('').toLowerCase();

interface Hit { subject: Subject; noteSemester: Semester; label: string }

/** Every subject with its notes page, in the chosen curriculum order (2025 view: listed under its 2025 semester). */
function allSubjects(structure: Structure): Hit[] {
  const course = semesters.filter((s) => /^\d+$/.test(s.id));
  const extras = semesters.filter((s) => !/^\d+$/.test(s.id));
  const hits: Hit[] = structure === '2025'
    ? semesters2025.flatMap((s) => s.courses.filter((c) => c.subject && c.noteSemester && !c.subject.electiveSlot)
      .map((c) => ({ subject: c.subject!, noteSemester: c.noteSemester!, label: s.label })))
    : course.flatMap((sem) => sem.subjects.filter((s) => !isSyllabus(s) && !s.electiveSlot).map((s) => ({ subject: s, noteSemester: sem, label: sem.label })));
  return [...hits, ...extras.flatMap((sem) => sem.subjects.filter((s) => !isSyllabus(s)).map((s) => ({ subject: s, noteSemester: sem, label: sem.label })))];
}

/** Search box on the home page: find a subject's notes by name, short form, folder or course code.
 * `children` (the semester cards) show while nothing is typed; results replace them while searching. */
export function SubjectSearch({ structure, children }: { structure: Structure; children: ReactNode }) {
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? allSubjects(structure).filter(({ subject }) => {
    const folder = subject.folder?.split('/').pop() ?? '';
    const hay = `${subject.name} ${folder} ${subject.code} ${initials(subject.name)}`.toLowerCase();
    const compact = normalizeName(hay);
    return words.every((w) => hay.includes(w) || compact.includes(normalizeName(w)));
  }) : [];

  return (
    <>
      <label className="pqi-search home-search">
        <Search size={18} />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes by subject, e.g. DSA, Calculus, Machine Learning" aria-label="Search notes by subject" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
      </label>
      {words.length === 0 ? children : (
        <div className="pqi-results home-results" aria-live="polite">
          {results.length ? results.map(({ subject, noteSemester, label }) => (
            <Link key={`${label}:${subject.id}`} to={subjectPath(noteSemester, subject)} className={`pqi-result ${subject.files.length ? '' : 'is-empty'}`}>
              <span className="pqi-result-name"><strong>{subject.name}</strong>{subject.kind === 'course' && <b>{subject.code}</b>}</span>
              <span className="pqi-result-sem">{label}{noteSemester.label !== label ? ` · filed in ${noteSemester.label}` : ''}</span>
              <span className="pqi-result-count">{subject.files.length ? plural(subject.files.length, 'file') : 'No notes yet'}</span>
              <ArrowRight size={15} />
            </Link>
          )) : <p className="pqi-noresult">No subject matches “{query}”. Try a shorter word or a short form like “DSA”.</p>}
        </div>
      )}
    </>
  );
}
