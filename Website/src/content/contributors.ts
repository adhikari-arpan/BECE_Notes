export interface Contributor {
  name: string;
  role: string;
  semester: string;
  subjects: string[];
  /** Photo in Website/public, e.g. 'contributors/jane-doe.jpg'. Initials are shown without one. */
  photo?: string;
  website?: string;
  email?: string;
}

export const contributors: Contributor[] = [
  {
    name: 'Arpan Adhikari',
    role: 'Founder & Lead Curator',
    semester: 'All semesters',
    subjects: ['Complete collection compilation', 'Repository structure & organization', 'Ongoing maintenance'],
    photo: 'contributors/arpan-adhikari.jpg',
    website: 'https://www.arpanadhikari7.com.np',
    email: 'adhikariarpan2063@gmail.com',
  },
];
