/**
 * Pokhara University undergraduate academic rules, summarised from
 * https://pu.edu.np/examination/academic-system/ — shared by the guide page and the prerendered
 * HTML (so search engines and AI assistants can read it too).
 */

export const PU_GUIDE_PATH = '/pu-grading-system';

export const PU_GUIDE_TITLE = 'Pokhara University Grading System, SGPA & CGPA — Complete Guide';

export const PU_GUIDE_DESCRIPTION =
  'How Pokhara University (PU) grades undergraduate students: internal and external marks (50/50), 45% pass marks, ' +
  'the A–F grading scale, how SGPA and CGPA are calculated with examples, minimum CGPA, distinction, retakes and more.';

/** Common questions, answered from the PU rules (also published as FAQ structured data). */
export const PU_FAQS: { q: string; a: string }[] = [
  {
    q: 'How is the final grade calculated at Pokhara University?',
    a: 'For undergraduate programs such as BE Computer, the final score of a course is 50% of the internal examination marks plus 50% of the external (semester-end) examination marks: Final = 0.50 × Internal + 0.50 × External. The final score is then converted to a letter grade (A to F).',
  },
  {
    q: 'What is the pass mark at Pokhara University?',
    a: 'Undergraduate students must score at least 45% in the internal evaluation and at least 45% in the external semester-end examination, separately. A final score below 45 is an F.',
  },
  {
    q: 'What happens if I fail the internal evaluation?',
    a: 'A student who fails the internal evaluation is "Not Qualified" to sit the semester-end (external) examination for that course.',
  },
  {
    q: 'How is SGPA calculated?',
    a: 'SGPA (Semester Grade Point Average) = sum of (credit hours × grade point) for every course in the semester, divided by the total credit hours of that semester.',
  },
  {
    q: 'How is CGPA calculated?',
    a: 'CGPA (Cumulative Grade Point Average) is the same calculation over all semesters together: sum of (credit hours × grade point) for every course taken, divided by all credit hours. It is weighted by credits, so it is not simply the average of your SGPAs.',
  },
  {
    q: 'What is the minimum CGPA required at Pokhara University?',
    a: 'Undergraduate students are expected to maintain a CGPA of at least 2.0. A student whose performance does not show the possibility of maintaining it may be dismissed from the program.',
  },
  {
    q: 'What CGPA is needed for distinction and the Dean’s List?',
    a: 'An undergraduate degree with distinction needs a CGPA of 3.60 or better. The Dean’s List needs a CGPA of at least 3.7.',
  },
  {
    q: 'Can I retake a course at Pokhara University?',
    a: 'A failed course must be retaken when the college offers it. Within the maximum duration of the program, you may also retake at most two passed courses to reach the minimum CGPA of 2.0. The retake grade replaces the earlier grade.',
  },
  {
    q: 'What is the attendance requirement at Pokhara University?',
    a: 'At least 80% attendance of the classes actually held. A student continuously absent for more than four weeks without notifying the head of the institution may be removed from the college rolls.',
  },
  {
    q: 'How long can I take to finish a BE degree at Pokhara University?',
    a: 'Technical programs of 4 years (8 semesters) must be completed within at most 8 years (16 semesters).',
  },
];

/** When the rules above were checked against the PU website. */
export const PU_GUIDE_SOURCE = {
  url: 'https://pu.edu.np/examination/academic-system/',
  title: 'Pokhara University — Academic System',
  retrieved: 'September 30, 2026',
};
