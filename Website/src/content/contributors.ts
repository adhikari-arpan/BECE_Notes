import { authors } from 'virtual:notes-manifest';

export interface Contributor {
  name: string;
  /**
   * GitHub username. Files uploaded on GitHub are recorded under your GitHub account (not the name you
   * type here), so this is how the files you added are found and counted automatically.
   */
  github?: string;
  /** Photo in Website/public, e.g. 'images/contributors/jane-doe.jpg'. Initials are shown without one. */
  photo?: string;
  /** Optional small (96 px) version of the photo, used where it's shown tiny. */
  photoSmall?: string;
  /** Founder card only. */
  role?: string;
  semester?: string;
  subjects?: string[];
  website?: string;
  email?: string;
}

const founder: Contributor = {
  name: 'Arpan Adhikari',
  github: 'adhikari-arpan',
  role: 'Founder & Lead Curator',
  semester: 'All semesters',
  subjects: ['Complete website build', 'Complete collection compilation', 'Repository structure & organization', 'Ongoing maintenance'],
  photo: 'images/contributors/arpan-adhikari.webp',
  photoSmall: 'images/contributors/arpan-adhikari-96.webp',
  website: 'https://www.arpanadhikari7.com.np',
  email: 'adhikariarpan2063@gmail.com',
};

/* ============================================================================================
 *  CONTRIBUTORS: ADD YOURSELF HERE
 * ============================================================================================
 *
 *  Once you have at least 10 accepted files (notes and past papers together):
 *
 *    1. Copy the template below and paste it at the END of the list.
 *    2. Remove the "//" at the start of each line.
 *    3. Fill in your details. Only `name` and `github` are required.
 *
 *  Your note and past paper counts are added automatically. Don't change anything outside this list.
 *  Full guide: CONTRIBUTING.md → "Getting credited".
 *
 *  Template:
 *
 *    // {
 *    //   name: 'Your Full Name',
 *    //   github: 'your-github-username',
 *    //   photo: 'images/contributors/firstname-lastname.jpg', // optional, in Website/public/images/contributors/
 *    // },
 *
 * ============================================================================================ */

const community: Contributor[] = [
  // ↓ Add your entry below this line ↓

];

/* ============================================================================================
 *  END OF CONTRIBUTORS LIST: no need to edit anything below
 * ============================================================================================ */

export const contributors: Contributor[] = [founder, ...community];

const lower = (s?: string) => (s ?? '').trim().toLowerCase();
/** "155653693+jane@users.noreply.github.com" → "jane" (GitHub's private commit email). */
const noreplyUser = (email: string) => /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i.exec(email)?.[1]?.toLowerCase();

/** Files a contributor added, from every git identity that's theirs (name, email or GitHub username). */
export function filesAdded(c: Contributor) {
  const names = new Set([lower(c.name), lower(c.github)].filter(Boolean));
  const mine = authors.filter((a) =>
    names.has(lower(a.name)) || (!!c.email && lower(a.email) === lower(c.email)) || (!!c.github && noreplyUser(a.email) === lower(c.github)));
  return {
    notes: mine.reduce((n, a) => n + a.notes, 0),
    pastQuestions: mine.reduce((n, a) => n + a.pastQuestions, 0),
  };
}

/** Most files first; the founder always stays first. */
const byCount = (count: (c: Contributor) => number) => [
  founder,
  ...community.filter((c) => count(c) > 0).sort((a, b) => count(b) - count(a) || a.name.localeCompare(b.name)),
];

export const noteContributors = byCount((c) => filesAdded(c).notes);
export const pastQuestionContributors = byCount((c) => filesAdded(c).pastQuestions);
export const FOUNDER = founder;
