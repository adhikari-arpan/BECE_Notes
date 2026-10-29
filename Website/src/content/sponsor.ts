import { allFiles, isSyllabus, pastQuestionCollections, semesters } from '@/content/notes';
import { studyGuides } from '@/content/studyGuides';
import { contributors } from '@/content/contributors';

/** Shared by /sponsor, /analytics and the pitch PDF. */
export const SPONSOR_EMAIL = 'adhikariarpan2063@gmail.com';
export const sponsorMailto = (subject = 'Sponsoring BECE Vault') => `mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(subject)}`;

/** What's on the site (from the notes manifest). */
export const SITE_LIBRARY = {
  files: allFiles.length,
  papers: pastQuestionCollections.reduce((t, c) => t + c.files.length, 0),
  subjects: semesters.flatMap((s) => s.subjects).filter((s) => !isSyllabus(s) && s.files.length > 0).length,
  guides: studyGuides.length,
  contributors: contributors.length,
};

/** The places a sponsor can appear (each drawn as a mock-up on /sponsor). */
export type SponsorSpot = 'footer' | 'home' | 'exam';

export interface SponsorTier {
  id: string;
  name: string;
  tagline: string;
  /**
   * Monthly price in NPR. Leave null to show "Price on request".
   * Set it here when you've decided, e.g. `price: 5000`.
   */
  price: number | null;
  includes: string[];
  /** The spot this tier adds (shown as its mock-up); a tier also keeps the spots of the ones before it. */
  spot: SponsorSpot;
  /** Shown as the recommended tier. */
  featured?: boolean;
}

/** The sponsorship tiers on /sponsor. Edit freely: names, what's included, prices. */
export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    tagline: 'Your name on every page',
    spot: 'footer',
    price: null,
    includes: [
      '“Supported by” credit with your logo in the footer of every page',
      'Logo links to your website',
      'Listed on the sponsor page',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    tagline: 'Front and centre on the home page',
    spot: 'home',
    price: null,
    featured: true,
    includes: [
      'Everything in Supporter',
      'Home page banner with your logo and one line, under the main heading',
      'A monthly summary of visitor numbers from the live analytics',
    ],
  },
  {
    id: 'exam-partner',
    name: 'Exam-season Partner',
    tagline: 'Reach students when they study hardest',
    spot: 'exam',
    price: null,
    includes: [
      'Everything in Featured',
      'Spotlight card on the past papers and study guides pages during Pokhara University exam weeks',
      'One sponsor per season: no other brand shares the spot',
    ],
  },
];

export const tierPrice = (t: SponsorTier) => (t.price === null ? 'Price on request' : `NPR ${t.price.toLocaleString('en-US')}`);
