import { ArrowLeft, BookOpen, FolderOpen, GraduationCap, Handshake, Mail, Shield, Sparkles, Users } from 'lucide-react';
import { allFiles, semesters } from '@/content/notes';

interface AboutViewProps {
  onBack: () => void;
}

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';

const semestersWithNotes = semesters.filter((s) => /^\d+$/.test(s.id) && s.subjects.some((sub) => sub.files.length > 0));
const coverage = semestersWithNotes.length
  ? `${semestersWithNotes[0].label} to ${semestersWithNotes[semestersWithNotes.length - 1].label}`
  : 'every semester';

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <>
      <section className="semester-page-header section-wrap">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to home
        </button>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">The story</span>
            <h2>About this collection</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-intro">
            <p>
              BECE Notes is a free, semester-wise library of study notes for the Bachelor of Engineering in
              Computer Engineering (BECE) program under Pokhara University (PU), Nepal.
            </p>
          </div>

          <div className="content-page-section">
            <h3><GraduationCap size={18} /> What this is</h3>
            <p>
              Everything a Computer Engineering student at a Pokhara University affiliated college needs, in one place and
              organized the way the PU curriculum is: by semester, then by subject. The collection currently covers{' '}
              <strong>{coverage}</strong> plus electives, with {allFiles.length.toLocaleString('en-US')} files and growing
              as new semesters are completed.
            </p>
          </div>

          <div className="content-page-section">
            <h3><FolderOpen size={18} /> What you'll find</h3>
            <ul>
              <li><Sparkles size={16} /> Complete and chapter-wise lecture notes, handwritten and typed</li>
              <li><Sparkles size={16} /> Question collections, past exam questions and assessment questions</li>
              <li><Sparkles size={16} /> Lab works, lab reports and assignments</li>
              <li><Sparkles size={16} /> Syllabus for each semester, slides and reference books</li>
              <li><Sparkles size={16} /> Elective subjects such as NLP, Generative AI, Big Data, .NET and Cybersecurity</li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><BookOpen size={18} /> Where the notes come from</h3>
            <p>
              Most of the notes here are my own, written and compiled while studying BECE at Nepal College of
              Information Technology (NCIT). The rest are notes I used and found helpful during my engineering: material
              shared by teachers, friends and seniors, and class notes from colleges such as NCIT, PEC and NAST. Where
              the source is known, the folder is labelled with it.
            </p>
            <p>
              All credit goes to the original authors. This collection exists to help students find good study material
              easily, not to take credit for anyone's work.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Handshake size={18} /> Claim or remove your notes</h3>
            <p>
              If any notes in this collection are yours and you want them credited differently or removed, please email me
              directly at <a href={`mailto:${CONTACT_EMAIL}?subject=BECE%20Notes%20-%20Note%20removal%20or%20credit%20request`}>{CONTACT_EMAIL}</a>.
              Mention the file name or link, and include something that shows the notes are yours. I'll respond as soon as
              possible and remove or credit the notes.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Users size={18} /> Who it's for</h3>
            <p>
              BECE students at Pokhara University colleges, anyone preparing for PU semester exams, and students in related
              programs studying the same subjects: C programming, data structures, DBMS, operating systems, computer
              graphics, microprocessors, AI, compiler design and more.
            </p>
          </div>

          <div className="content-page-section">
            <h3><BookOpen size={18} /> Started by</h3>
            <p>
              This collection was started and is maintained by <strong>Arpan Adhikari</strong>, a Computer Engineering
              student at Nepal College of Information Technology (NCIT). Contributions from other students are welcome.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Shield size={18} /> Disclaimer</h3>
            <p>
              These notes are meant to supplement official course materials, not replace them. Always refer to the official
              Pokhara University syllabus, textbooks and your instructors' guidance.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Mail size={18} /> Contact</h3>
            <p>
              Questions, suggestions or note removal requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
