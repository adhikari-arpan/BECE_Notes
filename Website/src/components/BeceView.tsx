import { ArrowRight, BookOpen, Briefcase, Calculator, Cpu, FileStack, GraduationCap, Layers, MapPin, ScrollText } from 'lucide-react';
import { Link } from '@/components/Link';
import { Logo } from '@/components/Logo';
import { PageHero } from '@/components/PageHero';
import { StructureToggle } from '@/components/StructureToggle';
import { syllabusPath, syllabusSemesters } from '@/content/curriculum2025';
import { PU_GUIDE_PATH } from '@/content/puGuide';
import { STRUCTURE_LABELS, useStructure } from '@/content/structure';
import './PokharaUniversityView.css';
import './BeceView.css';

/** The main areas the course list covers, each with a few of its courses as examples. */
const AREAS: [string, string][] = [
  ['Mathematics and science', 'Calculus, algebra and geometry, applied physics and chemistry, numerical methods, probability and statistics.'],
  ['Programming and software', 'C, object-oriented C++, Java, data structures and algorithms, software engineering.'],
  ['Hardware and electronics', 'Digital logic, electronic devices and circuits, microprocessors, computer architecture, embedded systems.'],
  ['Systems and networks', 'Operating systems, databases, data communication, computer networks, network and cyber security.'],
  ['Intelligent and visual computing', 'Artificial intelligence, machine learning, image processing, computer graphics, data science.'],
  ['Engineering practice', 'Engineering drawing, management, economics, research fundamentals, projects and an internship.'],
];

const SITE_LINKS: { to: string; icon: typeof BookOpen; title: string; text: string }[] = [
  { to: '/notes', icon: BookOpen, title: 'Semester notes', text: 'Notes for every semester and elective.' },
  { to: '/past-questions', icon: FileStack, title: 'Past questions', text: 'PU exam papers by semester, subject and year.' },
  { to: '/syllabus', icon: ScrollText, title: 'Full syllabus', text: 'Course codes, credit hours and weekly hours.' },
  { to: PU_GUIDE_PATH, icon: GraduationCap, title: 'PU grading system', text: 'Internal and external marks, SGPA and CGPA.' },
  { to: '/cgpa-calculator', icon: Calculator, title: 'CGPA calculator', text: 'Work out your SGPA and CGPA on the PU scale.' },
  { to: '/pokhara-university', icon: MapPin, title: 'Pokhara University', text: 'The university behind the programme.' },
];

/** /be-computer-engineering: what the BE Computer Engineering (BECE) programme at Pokhara University is, built from the syllabus data. */
export function BeceView() {
  const structure = useStructure();
  const semesters = syllabusSemesters(structure);
  const totalCredits = semesters.reduce((sum, s) => sum + s.courses.reduce((a, c) => a + c.credits, 0), 0);
  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const years = [1, 2, 3, 4].map((y) => semesters.filter((s) => Math.ceil(s.id / 2) === y));

  const facts: [string, string][] = [
    ['Degree', 'Bachelor of Engineering in Computer Engineering'],
    ['University', 'Pokhara University, Nepal'],
    ['Faculty', 'Science and Technology'],
    ['Duration', `4 years, ${semesters.length} semesters`],
    ['Terms', 'Fall and Spring, with semester exams'],
    ['Course load', `${totalCourses} courses, ${totalCredits} credits`],
  ];

  return (
    <>
      <section className="semester-page-header content-page-header section-wrap pqi-header">
        <PageHero
          share="About BE Computer Engineering at Pokhara University"
          logo={<span className="bece-hero-logo"><Logo /></span>}
          title={<>BE Computer <em>Engineering</em></>}
          kicker="About the programme"
          lead="What BECE at Pokhara University covers: the degree, its four years and where to study each part."
        />
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-section">
            <p className="content-page-lead pu-lead">
              BE Computer Engineering (BECE) is Pokhara University’s four-year undergraduate degree in computer
              engineering. It combines the software side of computing with the hardware it runs on: programming, data
              structures and systems alongside digital logic, microprocessors and electronics, built on a base of
              mathematics and science. It is taught at PU’s School of Engineering and its affiliated engineering colleges.
            </p>
            <dl className="pu-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="bece-structure-note">
              Course figures follow the <strong>{STRUCTURE_LABELS[structure].toLowerCase()}</strong> curriculum. Switch to see the other:
            </p>
            <StructureToggle />
          </div>

          <div className="content-page-section">
            <h3><Cpu size={18} /> What you study</h3>
            <ul className="pu-faculties">
              {AREAS.map(([name, text]) => (
                <li key={name}><strong>{name}</strong><span>{text}</span></li>
              ))}
            </ul>
          </div>

          <div className="content-page-section">
            <h3><Layers size={18} /> Year by year</h3>
            <div className="bece-years">
              {years.map((sems, i) => (
                <div key={i} className="bece-year">
                  <span className="bece-year-label">Year {['I', 'II', 'III', 'IV'][i]}</span>
                  {sems.map((s) => (
                    <Link key={s.id} to={syllabusPath(s.id)} className="bece-sem">
                      <strong>{s.label} <ArrowRight size={13} /></strong>
                      <small>{s.courses.map((c) => c.name).join(' · ')}</small>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="content-page-section">
            <h3><Briefcase size={18} /> After the degree</h3>
            <p>
              Graduates work across software development, networking and security, embedded and hardware systems, data and
              AI, or go on to a master’s degree. The final year’s project and internship give first hands-on experience
              with real work.
            </p>
          </div>

          <div className="content-page-section">
            <h3><GraduationCap size={18} /> BECE on BECE Vault</h3>
            <div className="pu-links">
              {SITE_LINKS.map(({ to, icon: Icon, title, text }) => (
                <Link key={to} to={to} className="pu-link">
                  <Icon size={18} />
                  <span><strong>{title}</strong><small>{text}</small></span>
                  <ArrowRight size={15} className="pu-link-go" />
                </Link>
              ))}
            </div>
          </div>

          <p className="pu-source">
            <MapPin size={13} />
            <span>
              Courses and credits come from the PU syllabus published on this site. BECE Vault is an independent student
              project, not part of Pokhara University. For official notices, check{' '}
              <a href="https://pu.edu.np" target="_blank" rel="noreferrer">pu.edu.np</a>.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
