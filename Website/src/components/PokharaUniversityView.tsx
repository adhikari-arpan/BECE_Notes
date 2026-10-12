import { ArrowLeft, ArrowRight, BookOpen, Building2, Calculator, ExternalLink, FileStack, GraduationCap, Landmark, Layers, MapPin, ScrollText, Target } from 'lucide-react';
import { Link } from '@/components/Link';
import { PU_GUIDE_PATH } from '@/content/puGuide';
import './PokharaUniversityView.css';

/** Checked against pu.edu.np and Wikipedia on this date. */
export const PU_INFO_CHECKED = '10 October 2026';

const FACTS: [string, string][] = [
  ['Established', '1997 (2054 B.S.), under the Pokhara University Act'],
  ['Type', 'Public, non-profit and autonomous'],
  ['Central office', 'Pokhara Metropolitan City-30, Kaski, Gandaki Province'],
  ['Chancellor', 'The Prime Minister of Nepal'],
  ['Pro-Chancellor', 'The Minister for Education'],
  ['Website', 'pu.edu.np'],
];

const FACULTIES = [
  ['Science and Technology', 'Engineering, including BE Computer Engineering (BECE), and other science programmes'],
  ['Management Studies', 'Business and hospitality programmes such as BBA, MBA and BHM'],
  ['Humanities and Social Sciences', 'Development and social science programmes'],
  ['Health Sciences', 'Nursing, pharmacy, public health and allied health programmes'],
];

const SITE_LINKS: { to: string; icon: typeof BookOpen; title: string; text: string }[] = [
  { to: '/syllabus', icon: ScrollText, title: 'BE Computer Engineering syllabus', text: 'All 8 semesters: courses, codes and credit hours.' },
  { to: PU_GUIDE_PATH, icon: GraduationCap, title: 'PU grading system', text: 'Internal and external marks, grades, SGPA and CGPA.' },
  { to: '/cgpa-calculator', icon: Calculator, title: 'CGPA calculator', text: 'Work out your SGPA and CGPA on the PU scale.' },
  { to: '/past-questions', icon: FileStack, title: 'Past questions', text: 'PU exam papers by semester, subject and year.' },
  { to: '/', icon: BookOpen, title: 'Semester notes', text: 'Notes for every BECE semester and elective.' },
];

/** /pokhara-university: an overview of Pokhara University, linking to the site's PU guides. */
export function PokharaUniversityView() {
  return (
    <>
      <section className="semester-page-header content-page-header section-wrap">
        <Link to="/" className="back-button"><ArrowLeft size={16} /> Back to home</Link>
        <div className="pu-hero">
          <img src={`${import.meta.env.BASE_URL}images/pokhara-university-logo.png`} alt="Pokhara University logo" width={900} height={350} className="pu-hero-logo" />
          <div>
            <span className="section-kicker">About the university</span>
            <h2>Pokhara University</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-section">
            <p className="content-page-lead pu-lead">
              Pokhara University (PU, also written PoU) is a public university in Nepal, headquartered in Pokhara, Kaski.
              Founded in 1997, it runs its own schools and affiliates colleges across the country, including the colleges
              that teach the Bachelor of Engineering in Computer Engineering (BECE) covered by BECE Vault.
            </p>
            <dl className="pu-facts">
              {FACTS.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{k === 'Website' ? <a href="https://pu.edu.np" target="_blank" rel="noreferrer">{v} <ExternalLink size={12} /></a> : v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="content-page-section">
            <h3><Landmark size={18} /> History</h3>
            <p>
              The idea of a university in the western region was conceived in 1986, and Pokhara University was established
              in 1997 under the Pokhara University Act. It is partly funded by the Government of Nepal and partly by its own
              revenue from students and affiliated colleges. Its central office is in Pokhara, with an academic complex in
              Lekhnath.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Layers size={18} /> Faculties</h3>
            <p>Teaching is organised into four faculties. BE Computer Engineering belongs to the Faculty of Science and Technology.</p>
            <ul className="pu-faculties">
              {FACULTIES.map(([name, text]) => (
                <li key={name}><strong>{name}</strong><span>{text}</span></li>
              ))}
            </ul>
          </div>

          <div className="content-page-section">
            <h3><Building2 size={18} /> Schools and colleges</h3>
            <p>
              PU runs its own constituent schools, such as the School of Engineering, the School of Business and the School
              of Health and Allied Sciences, and affiliates around 60 colleges across Nepal, mostly in Kathmandu, Pokhara,
              Chitwan and other cities. Programmes follow a <strong>semester system</strong>, with Fall and Spring terms.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Target size={18} /> Vision and mission</h3>
            <p>
              PU’s stated vision is <em>“to be a leader in the promotion of education through quality higher education,
              health, and community service”</em>. Its mission includes developing the university into a centre of
              excellence for higher education and linking it with community services.
            </p>
          </div>

          <div className="content-page-section">
            <h3><GraduationCap size={18} /> PU guides on BECE Vault</h3>
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
              Sources: <a href="https://pu.edu.np/about-us/" target="_blank" rel="noreferrer">pu.edu.np</a> and{' '}
              <a href="https://en.wikipedia.org/wiki/Pokhara_University" target="_blank" rel="noreferrer">Wikipedia</a>, checked
              on {PU_INFO_CHECKED}. BECE Vault is an independent student project, not part of Pokhara University. For
              official notices, check pu.edu.np.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
