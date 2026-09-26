import { ArrowLeft, Coffee, FolderOpen, GraduationCap, Handshake, Mail, Shield, Sparkles, UserRound, Users } from 'lucide-react';
import { Link } from '@/components/Link';
import { allFiles, semesters } from '@/content/notes';
import { openTipJar } from '@/content/tipJar';

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';

// "Semester I to VI" — kept in sync with the notes actually in the repository.
const semestersWithNotes = semesters.filter((s) => /^\d+$/.test(s.id) && s.subjects.some((sub) => sub.files.length > 0));
const coverage = semestersWithNotes.length
  ? `${semestersWithNotes[0].label} to ${semestersWithNotes[semestersWithNotes.length - 1].label.replace(/^Semester\s+/, '')}`
  : 'every semester';

export function AboutView() {
  return (
    <>
      <section className="semester-page-header content-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">The story</span>
            <h2>About this collection</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-section">
            <h3><GraduationCap size={18} /> What this is</h3>
            <p className="content-page-lead">
              BECE Notes is a free, semester-wise library of study notes for the Bachelor of Engineering in Computer
              Engineering (BECE) program under Pokhara University (PU), Nepal.
            </p>
            <p>
              The goal is simple: everything a BECE student needs, organized the way the PU curriculum actually works — by
              semester, then by subject. The collection currently spans <strong>{coverage}</strong> plus electives, with{' '}
              <strong>{allFiles.length.toLocaleString('en-US')} files</strong> and counting as new semesters get added.
            </p>
          </div>

          <div className="content-page-section">
            <h3><FolderOpen size={18} /> What you'll find</h3>
            <ul>
              <li><Sparkles size={16} /> Complete and chapter-wise lecture notes — handwritten and typed</li>
              <li><Sparkles size={16} /> Question collections, past exam papers, and assessment questions</li>
              <li><Sparkles size={16} /> Lab works, lab reports, and assignments</li>
              <li><Sparkles size={16} /> Syllabus, slides, and reference books for each semester</li>
              <li><Sparkles size={16} /> Electives including NLP, Generative AI, Big Data, .NET, and Cybersecurity</li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><Handshake size={18} /> Where the notes come from</h3>
            <p>
              Most of what's here is mine — written and compiled while studying BECE at NCIT. The rest is material I relied
              on and found genuinely useful along the way: notes shared by teachers, friends, and seniors, and class notes
              from different colleges in Pokhara University. Where the source is known, the folder credits it.
            </p>
            <p>
              All credit belongs to the original authors. This collection exists to make good study material easy to find —
              not to take credit for anyone's work.
            </p>
            <div className="content-page-callout">
              <strong>Is something here yours?</strong> If you'd like your notes credited differently or taken down, email
              me at{' '}
              <a href={`mailto:${CONTACT_EMAIL}?subject=BECE%20Notes%20-%20Credit%20or%20removal%20request`}>{CONTACT_EMAIL}</a>{' '}
              with the file name or link and something confirming it's yours. I'll sort it out promptly.
            </div>
          </div>

          <div className="content-page-section">
            <h3><Users size={18} /> Who it's for</h3>
            <p>
              BECE students at any PU-affiliated college, anyone prepping for PU semester exams, and students in related
              programs covering the same ground — C programming, data structures, DBMS, operating systems, computer
              graphics, microprocessors, AI, compiler design, and more.
            </p>
          </div>

          <div className="content-page-section">
            <h3><UserRound size={18} /> Who's behind it</h3>
            <p>
              Started and maintained by <strong>Arpan Adhikari</strong>, a Computer Engineering student at Nepal College of
              Information Technology (NCIT). A lot of effort has gone into building and organizing this collection, with the
              hope that it genuinely helps every Computer Engineering student across Pokhara University. Contributions from
              other students are always welcome.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Coffee size={18} /> Support this project</h3>
            <p>
              If this collection saved you some time or helped you prep for an exam, consider buying me a chiya — it keeps
              this project going and motivates future updates.
            </p>
            <button className="chiya-cta" onClick={openTipJar}><Coffee size={16} /> Buy me a Chiya · Rs. 50 a cup</button>
          </div>

          <div className="content-page-section">
            <h3><Shield size={18} /> A quick disclaimer</h3>
            <p>
              These notes supplement your official course materials — they don't replace them. Always cross-check with the
              official PU syllabus, your textbooks, and your instructors.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Mail size={18} /> Get in touch</h3>
            <p>
              Questions, suggestions, or removal requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
