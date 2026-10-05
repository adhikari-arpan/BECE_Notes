export interface Contributor {
  name: string;
  role: string;
  semester: string;
  subjects: string[];
  /** Photo in Website/public, e.g. 'images/contributors/jane-doe.jpg'. Initials are shown without one. */
  photo?: string;
  website?: string;
  email?: string;
  contact?: string;
}

const founder: Contributor = {
  name: 'Arpan Adhikari',
  role: 'Founder & Lead Curator',
  semester: 'All semesters',
  subjects: ['Complete collection compilation', 'Repository structure & organization', 'Ongoing maintenance'],
  photo: 'images/contributors/arpan-adhikari.webp',
  website: 'https://www.arpanadhikari7.com.np',
  email: 'adhikariarpan2063@gmail.com',
};

/**
 * Contributors with at least 10 accepted note files. Add yourself at the END of this list
 * (see CONTRIBUTING.md → "Getting credited").
 */
const community: Contributor[] = [
  // ─── Copy the block below, Donot change the code above. remove the "//" at the start of each line, and fill in your details. ───
  // {
  //   name: 'Your Full Name',
  //   role: 'Contributor',
  //   semester: 'Semester III', // the semester(s) you contributed to
  //   subjects: ['Subject One', 'Subject Two'], // subjects you added notes for
  //   photo: 'images/contributors/firstname-lastname.jpg', // optional: put the photo in Website/public/images/contributors/
  //   contact: 'https://linkedin.com/in/your-name', // optional: ONE contact — email, website, LinkedIn, GitHub...
  // },
];

export const contributors: Contributor[] = [founder, ...community];
