export interface Contributor {
  name: string;
  role: string;
  semester: string;
  subjects: string[];
}

export const contributors: Contributor[] = [
  {
    name: 'Arpan Adhikari',
    role: 'Founder & Lead Curator',
    semester: 'All semesters',
    subjects: ['Complete collection compilation', 'Repository structure & organization', 'Ongoing maintenance'],
  },
];
