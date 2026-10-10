import { BookOpenCheck, FileUp, FolderTree, Github } from 'lucide-react';
import { Link } from '@/components/Link';
import { PAST_QUESTIONS_FOLDER, pastQuestionFolders, type Semester } from '@/content/notes';
import './PastQuestionsGuide.css';

const REPO_URL = 'https://github.com/adhikari-arpan/BECE_Notes';

/**
 * How to add papers to a semester's Past Question Collection: the folder for each subject, the file
 * name format and how many papers each subject has so far. Shown on the collection's page, which
 * appears even while it's empty so students can help fill it.
 */
export function PastQuestionsGuide({ semester }: { semester: Semester }) {
  const folders = pastQuestionFolders(semester);
  const folderUrl = `${REPO_URL}/tree/main/${encodeURIComponent(`Semester_${semester.id}`)}/${encodeURIComponent(PAST_QUESTIONS_FOLDER)}`;
  const term = Number(semester.id) % 2 ? 'Fall' : 'Spring';
  const total = folders.reduce((a, f) => a + f.papers, 0);

  return (
    <div className="pastq-guide">
      <div className="pastq-head">
        <span className="pastq-icon"><FileUp size={22} /></span>
        <div>
          <h3>Help build the past question collection</h3>
          <p>
            We’re collecting Pokhara University exam papers for {semester.label}, one folder per subject.
            {total === 0 ? ' It’s empty for now, so ' : ' It’s still growing, so '}
            every paper you add helps the next batch prepare.
          </p>
        </div>
      </div>

      <div className="pastq-format">
        <span>File name</span>
        <code>Year_Spring/Fall_ShortForm</code>
        <small>e.g. <code>{folders.find((f) => f.short)?.example ?? `2025_${term}_BDT.pdf`}</code>: the year the exam was held (AD), the term, then the subject’s short form below</small>
      </div>

      <ul className="pastq-list">
        {folders.map((f) => (
          <li key={f.folder}>
            <FolderTree size={14} />
            <span className="pastq-name">{f.folder}/ <b className="pastq-short">{f.short ?? 'elective short form'}</b></span>
            <code className="pastq-example">{f.example}</code>
            <span className={`pastq-count ${f.papers ? 'has' : ''}`}>{f.papers ? `${f.papers} ${f.papers === 1 ? 'paper' : 'papers'}` : 'Needed'}</span>
          </li>
        ))}
      </ul>

      <p className="pastq-note">
        <BookOpenCheck size={14} />
        <span>
          Put each paper directly in its subject’s folder. Electives use their own short form (e.g. <code>BDT</code> for
          Big Data Technologies). College assessments go in <code>College Assessments/2024_College_Assessments/</code>, one
          folder per year, with each file named after its subject.
        </span>
      </p>

      <div className="pastq-actions">
        <Link to="/contributing#past-question-papers" className="pastq-primary">How to send papers</Link>
        <a href={folderUrl} target="_blank" rel="noreferrer" className="pastq-secondary"><Github size={14} /> Open folder on GitHub</a>
      </div>
    </div>
  );
}
