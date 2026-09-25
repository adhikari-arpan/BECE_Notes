import { ArrowLeft, GitBranch, FileText, Mail, CheckCircle2 } from 'lucide-react';

interface ContributingViewProps {
  onBack: () => void;
}

export function ContributingView({ onBack }: ContributingViewProps) {
  return (
    <>
      <section className="semester-page-header section-wrap">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to contributors
        </button>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Get involved</span>
            <h2>Contributing Guidelines</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-intro">
            <p>Thank you for your interest in contributing to the BECE Notes collection. Every contribution, big or small, helps fellow students across Pokhara University. Here's how you can help.</p>
          </div>

          <div className="content-page-section">
            <h3><FileText size={18} /> What you can contribute</h3>
            <ul>
              <li><CheckCircle2 size={16} /> New notes for subjects that are missing materials</li>
              <li><CheckCircle2 size={16} /> Question papers and past exams</li>
              <li><CheckCircle2 size={16} /> Lab manuals and project reports</li>
              <li><CheckCircle2 size={16} /> Improvements to existing notes (typos, formatting, clarity)</li>
              <li><CheckCircle2 size={16} /> Translations or simplified explanations</li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><GitBranch size={18} /> How to contribute</h3>
            <ol>
              <li>Fork the repository to your own account.</li>
              <li>Create a new branch for your changes (e.g. <code>add-cmp222-notes</code>).</li>
              <li>Add your files to the correct semester and subject folder, following the existing structure.</li>
              <li>Ensure your files are clearly named and free of sensitive or personal information.</li>
              <li>Submit a pull request with a brief description of what you added.</li>
            </ol>
          </div>

          <div className="content-page-section">
            <h3><CheckCircle2 size={18} /> Guidelines</h3>
            <ul>
              <li>Only submit materials you have the right to share. Respect copyright.</li>
              <li>Use clear, descriptive file names (e.g. <code>Midterm-Questions-2080.pdf</code>).</li>
              <li>Keep file sizes reasonable. Compress large PDFs when possible.</li>
              <li>Your pull request will be reviewed, and your name will be added to the contributors list upon merge.</li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><Mail size={18} /> Contact</h3>
            <p>Questions or concerns? Reach out to the repository owner at <code>adhikariarpan2063@gmail.com</code> with proof of ownership if you want material removed.</p>
          </div>
        </div>
      </section>
    </>
  );
}
