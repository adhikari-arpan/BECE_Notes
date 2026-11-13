import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { voteOnFile, votedOnFile } from '@/content/visits';

/** "Helpful? 👍 👎" for one file: an anonymous +1, once per file per browser. */
export function FileVote({ path }: { path: string }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(() => votedOnFile(path));
  const cast = (v: 'up' | 'down') => {
    if (vote) return;
    voteOnFile(path, v);
    setVote(v);
  };
  if (vote) return <span className="file-vote file-vote-done" role="status">Thanks for the feedback!</span>;
  return (
    <span className="file-vote">
      <span className="file-vote-label">Helpful?</span>
      <button onClick={() => cast('up')} aria-label="Yes, this file was helpful" title="Helpful"><ThumbsUp size={14} /></button>
      <button onClick={() => cast('down')} aria-label="No, this file wasn't helpful" title="Not helpful"><ThumbsDown size={14} /></button>
    </span>
  );
}
