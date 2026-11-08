/**
 * Page titles and descriptions in the words students actually search for ("DBMS notes pdf pokhara
 * university"). Plain functions with no site imports, so the app and the prerender step share them.
 */

/** The short names subjects are searched by. Compared on the lowercase subject name. */
const ABBREVIATIONS: Record<string, string> = {
  'database management system': 'DBMS',
  'operating systems': 'OS',
  'data structure & algorithm': 'DSA',
  'object oriented programming in c++': 'OOP',
  'artificial intelligence': 'AI',
  'machine learning': 'ML',
  'natural language processing': 'NLP',
  'software engineering': 'SE',
  'computer networks': 'CN',
  'computer graphics': 'CG',
  'compiler design': 'CD',
  'theory of computation': 'TOC',
  'digital signal analysis & processing': 'DSAP',
  'image processing & pattern recognition': 'IPPR',
  'simulation & modeling': 'SM',
  'computer architecture': 'COA',
  'numerical methods': 'NM',
  'microprocessor & assembly language programming': 'Microprocessor',
  'electronic devices & circuits': 'EDC',
  'basic electrical engineering': 'BEE',
  'embedded system': 'ES',
};

const withAbbreviation = (name: string) => {
  const short = ABBREVIATIONS[name.toLowerCase()];
  return short ? `${name} (${short})` : name;
};
const codeOf = (code: string) => (/^(ELEC|SYLLABUS|RESOURCES)\b/.test(code) ? '' : code);

export const SITE_SEO_TITLE = 'BECE Vault – Computer Engineering Notes for Pokhara University BE';

export const subjectNotesTitle = (name: string, semester: string) =>
  `${withAbbreviation(name)} Notes PDF – ${semester}, Pokhara University BE Computer`;

/** The grey text in search results: subject, code, then its first units. */
export function subjectNotesDescription(name: string, code: string, semester: string, units: readonly (readonly [string, number?])[] = [], fallback = 'Lecture notes, handwritten notes, lab works and past questions.') {
  const c = codeOf(code);
  const topics = units.map((u) => u[0]).filter((u) => u !== 'Introduction').slice(0, 5).join(', ');
  return `Free ${withAbbreviation(name)}${c ? ` ${c}` : ''} notes PDF for ${semester}, Pokhara University BE Computer Engineering. ${topics ? `Unit-wise: ${topics}.` : fallback}`;
}

export const subjectPapersTitle = (name: string, semester: string) =>
  `${withAbbreviation(name)} Past Questions – ${semester}, Pokhara University BE Computer`;

export const subjectPapersDescription = (name: string, semester: string, count: number) =>
  `${count} past exam ${count === 1 ? 'paper' : 'papers'} for ${withAbbreviation(name)}, ${semester}, Pokhara University BE Computer Engineering, sorted by year. Free to read and download.`;
