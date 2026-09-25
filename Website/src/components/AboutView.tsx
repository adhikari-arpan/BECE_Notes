import { ArrowLeft, BookOpen, GraduationCap, Mail, Shield } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

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
            <p>This repository is a comprehensive collection of study notes for the Bachelor of Engineering in Computer Engineering (BECE) program under Pokhara University, Nepal.</p>
          </div>

          <div className="content-page-section">
            <h3><GraduationCap size={18} /> Overview</h3>
            <p>The content is organized semester-wise and subject-wise to help students easily access relevant materials. Each subject folder contains comprehensive notes, question papers, lab materials, and other helpful resources.</p>
          </div>

          <div className="content-page-section">
            <h3><BookOpen size={18} /> Started by</h3>
            <p>This collection was started by <strong>Arpan Adhikari</strong>, a student at Nepal College of Information Technology (NCIT). The materials follow the Pokhara University curriculum for the Bachelor's in Computer Engineering program. All credit goes to the original note creators.</p>
          </div>

          <div className="content-page-section">
            <h3><Shield size={18} /> Disclaimer</h3>
            <p>These notes are meant to supplement official course materials, not replace them. Always refer to official syllabi, textbooks, and instructor guidance.</p>
          </div>

          <div className="content-page-section">
            <h3><Mail size={18} /> Contact</h3>
            <p>If you are the owner of any note and want it removed from the collection, contact <code>adhikariarpan2063@gmail.com</code> along with proof of ownership.</p>
          </div>
        </div>
      </section>
    </>
  );
}
