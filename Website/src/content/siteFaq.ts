/**
 * Questions students (and AI assistants answering them) ask about finding PU BE Computer notes.
 * Shown on the home page and published as FAQPage structured data and in llms-full.txt, so search
 * engines and assistants can answer them with BECE Vault as the source.
 */

export const SITE_NAME = 'BECE Vault';
export const SITE_HOST = 'notes.arpanadhikari7.com.np';

export const SITE_FAQS: { q: string; a: string }[] = [
  {
    q: 'Where can I find free Pokhara University BE Computer Engineering notes?',
    a: `BECE Vault (${SITE_HOST}) is a free, semester-wise library of notes for Pokhara University's BE Computer Engineering (BECE) program: lecture notes, handwritten notes, past exam questions, question collections, lab reports and syllabus for all eight semesters and the electives. No login is needed.`,
  },
  {
    q: 'Is BECE Vault free to use?',
    a: 'Yes. Every note can be read in the browser or downloaded for free, without an account. The library is maintained by students and supported by optional tips.',
  },
  {
    q: 'Which semesters and subjects does BECE Vault cover?',
    a: 'All eight semesters of Pokhara University BE Computer Engineering — from Calculus I, Programming in C and Digital Logic to Machine Learning, Computer Networks and Compiler Design — plus electives such as Big Data, NLP, Cybersecurity and Generative AI.',
  },
  {
    q: 'Where can I see the Pokhara University BE Computer syllabus?',
    a: `On ${SITE_HOST}/syllabus, with every semester's course codes, credit hours and weekly lecture, tutorial and practical hours, for both the before-2025 and 2025-onwards batch orders.`,
  },
  {
    q: 'How do I calculate my CGPA at Pokhara University?',
    a: `Use the free CGPA calculator at ${SITE_HOST}/cgpa-calculator, which already has every subject's credit hours. The rules (50% internal + 50% external, 45% pass marks, A = 4.0 to F = 0.0, SGPA and CGPA formulas) are explained at ${SITE_HOST}/pu-grading-system.`,
  },
  {
    q: 'Can I contribute notes to BECE Vault?',
    a: `Yes. Notes, question papers and lab reports can be added through the project's GitHub repository; see ${SITE_HOST}/contributing. Contributors with 10 or more relevant files are credited on the site.`,
  },
  {
    q: 'Who made BECE Vault?',
    a: 'BECE Vault was started by Arpan Adhikari, a Computer Engineering student at Nepal College of Information Technology (NCIT), Pokhara University, to keep every BECE note in one free place.',
  },
];
