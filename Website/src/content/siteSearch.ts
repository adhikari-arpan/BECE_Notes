import { isSyllabus, normalizeName, pastQuestionCollections, pastQuestionFolders, pastQuestionsPath, pastSubjectPath, semesters, subjectPath } from '@/content/notes';
import { subjectAbbreviation } from '@/content/seo';
import { syllabusPath } from '@/content/curriculum2025';

/** One thing the site-wide search can find, with the words it's found by. */
export interface SearchItem {
  kind: 'subject' | 'unit' | 'file' | 'paper' | 'page';
  title: string;
  /** Where it is, e.g. "Semester III · Database Management System". */
  context: string;
  to: string;
  /** Lowercased text matched against the query. */
  haystack: string;
}

const lower = (s: string) => s.toLowerCase().replace(/[_]+/g, ' ');
const withoutExtension = (name: string) => name.replace(/\.[a-z0-9]+$/i, '');

let index: SearchItem[] | null = null;

/** Built on first use: every subject, unit, note file, past paper and main page. */
export function searchIndex(): SearchItem[] {
  if (index) return index;
  const items: SearchItem[] = [
    { kind: 'page', title: 'CGPA Calculator', context: 'Tools', to: '/cgpa-calculator', haystack: 'cgpa sgpa calculator gpa grade' },
    { kind: 'page', title: 'Syllabus & Course Structure', context: 'All semesters', to: syllabusPath(), haystack: 'syllabus course structure credits curriculum' },
    { kind: 'page', title: 'PU Grading System', context: 'Guide', to: '/pu-grading-system', haystack: 'grading system grades sgpa cgpa pass marks' },
    { kind: 'page', title: 'Past Questions', context: 'All semesters', to: pastQuestionsPath(), haystack: 'past questions papers old questions exam' },
    { kind: 'page', title: 'Semester-Wise Notes', context: 'All semesters', to: '/notes', haystack: 'notes all semesters' },
    { kind: 'page', title: 'Pokhara University', context: 'About', to: '/pokhara-university', haystack: 'pokhara university pu about' },
    { kind: 'page', title: 'Contribute notes', context: 'Get involved', to: '/contributing', haystack: 'contribute upload share notes add' },
  ];

  for (const semester of semesters) {
    for (const subject of semester.subjects) {
      if (subject.electiveSlot) continue;
      const short = subjectAbbreviation(subject.name);
      const where = `${semester.label} · ${subject.name}`;
      if (!isSyllabus(subject)) {
        items.push({
          kind: 'subject',
          title: subject.name,
          context: semester.label,
          to: subjectPath(semester, subject),
          haystack: lower(`${subject.name} ${subject.code} ${short ?? ''} ${semester.label} notes`),
        });
      }
      subject.units?.forEach(([unit], i) => {
        items.push({ kind: 'unit', title: `Unit ${i + 1}: ${unit}`, context: where, to: subjectPath(semester, subject), haystack: lower(`${unit} ${subject.name} ${short ?? ''}`) });
      });
      for (const file of subject.files) {
        items.push({
          kind: 'file',
          title: withoutExtension(file.name),
          context: `${where}${file.folder ? ` · ${file.folder.replace(/^_+/, '')}` : ''}`,
          to: subjectPath(semester, subject, file),
          haystack: lower(`${file.name} ${file.folder} ${subject.name} ${short ?? ''}`),
        });
      }
    }
  }

  for (const { semester, files } of pastQuestionCollections) {
    const folders = pastQuestionFolders(semester);
    for (const f of folders) {
      if (!f.papers) continue;
      const short = subjectAbbreviation(f.name);
      items.push({ kind: 'paper', title: `${f.name} past questions`, context: `${semester.label} · ${f.papers} papers`, to: pastSubjectPath(semester, f.name), haystack: lower(`${f.name} ${short ?? ''} ${f.short ?? ''} past questions papers ${semester.label}`) });
    }
    for (const file of files) {
      const top = file.folder.split('/')[0];
      const folder = folders.find((x) => normalizeName(x.folder) === normalizeName(top));
      const m = /^(\d{4})_(Spring|Fall)_/i.exec(file.name);
      const subjectName = folder?.name ?? top.replace(/_+/g, ' ');
      items.push({
        kind: 'paper',
        title: m ? `${subjectName} ${m[1]} ${m[2]}` : withoutExtension(file.name).replace(/_+/g, ' '),
        context: `${semester.label} · Past paper`,
        to: pastQuestionsPath(semester, file),
        haystack: lower(`${file.name} ${subjectName} ${subjectAbbreviation(subjectName) ?? ''} ${folder?.short ?? ''} past question paper exam`),
      });
    }
  }
  index = items;
  return items;
}

const KIND_ORDER: Record<SearchItem['kind'], number> = { subject: 0, page: 1, paper: 2, unit: 3, file: 4 };

/** Words of a text, for matching from the start of a word ("lab" finds "Lab Works", not "syllabus"). */
const tokens = (s: string) => s.split(/[^a-z0-9+#]+/).filter(Boolean);
const wordsOf = new WeakMap<SearchItem, string[]>();

/** Every word of the query must start a word of the item; titles that start with it come first. */
export function searchSite(query: string, limit = 40): SearchItem[] {
  const words = tokens(lower(query));
  if (!words.length) return [];
  const scored: [number, SearchItem][] = [];
  for (const item of searchIndex()) {
    const title = lower(item.title);
    let itemWords = wordsOf.get(item);
    if (!itemWords) wordsOf.set(item, (itemWords = tokens(`${title} ${item.haystack}`)));
    if (!words.every((w) => itemWords.some((t) => t.startsWith(w)))) continue;
    let score = KIND_ORDER[item.kind] * 10;
    if (title.startsWith(words[0])) score -= 25;
    else if (words.every((w) => title.includes(w))) score -= 12;
    scored.push([score, item]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].title.localeCompare(b[1].title, undefined, { numeric: true })).slice(0, limit).map(([, i]) => i);
}
