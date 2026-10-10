import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, MessageSquareHeart, Send, TriangleAlert } from 'lucide-react';
import { Link } from '@/components/Link';
import './FeedbackView.css';

const FORMSPREE_URL = 'https://formspree.io/f/moejdgdg';

/** What the feedback is about. */
const TOPICS = ['General', 'Notes', 'Past Questions', 'Syllabus', 'CGPA calculator', 'Grading guide', 'Design & layout', 'Something broken', 'New idea', 'Other'];
const OTHER = 'Other';

const MAX_MESSAGE = 2000;

/** The usual "anonymous" sign: a hat and glasses (incognito), drawn in the same line style as the other icons. */
function IncognitoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 11h20" />
      <path d="M5 11l1.6-6.1a1 1 0 0 1 1.3-.7L12 5.5l4.1-1.3a1 1 0 0 1 1.3.7L19 11" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M10 17c1.3-1 2.7-1 4 0" />
    </svg>
  );
}

/**
 * Website feedback at /feedback: a name (or the Anonymous switch), what it's about (or a subject of
 * their own under "Other"), and a message.
 * No email is asked for, since replies aren't sent. Submissions go to Formspree.
 */
export function FeedbackView() {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [otherTopic, setOtherTopic] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;
    const subject = topic === OTHER ? otherTopic.trim() || OTHER : topic;
    const sender = anonymous ? '' : name.trim();
    setStatus('sending');
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sender || 'Anonymous',
          topic: subject,
          message: message.trim(),
          _subject: `BECE Vault feedback: ${subject}`,
          // Hidden field that only bots fill in; Formspree drops those submissions.
          _gotcha: form.get('_gotcha') ?? '',
        }),
      });
      if (res.ok) {
        setStatus('sent');
        return;
      }
      const data = (await res.json().catch(() => null)) as { errors?: { message: string }[] } | null;
      setError(data?.errors?.map((x) => x.message).join(' ') || 'Couldn’t send your feedback. Please try again.');
      setStatus('error');
    } catch {
      setError('Couldn’t reach the server. Check your connection and try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setMessage('');
    setTopic(TOPICS[0]);
    setOtherTopic('');
    setStatus('idle');
  };

  return (
    <>
      <section className="semester-page-header content-page-header section-wrap">
        <Link to="/" className="back-button"><ArrowLeft size={16} /> Back to home</Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Help us improve</span>
            <h2>Website feedback</h2>
          </div>
        </div>
      </section>

      <section className="section-wrap feedback-wrap">
        {status === 'sent' ? (
          <div className="feedback-card feedback-done" role="status">
            <CheckCircle2 size={40} />
            <h3>Thank you{!anonymous && name.trim() ? `, ${name.trim()}` : ''}!</h3>
            <p>Your feedback has been sent. It helps make BECE Vault better for every student.</p>
            <div className="feedback-done-actions">
              <button type="button" className="feedback-secondary" onClick={reset}>Send more feedback</button>
              <Link to="/" className="feedback-secondary">Back to home</Link>
            </div>
          </div>
        ) : (
          <form className="feedback-card" onSubmit={submit}>
            <p className="feedback-intro">
              <MessageSquareHeart size={18} />
              <span>Found a mistake, missing notes or something hard to use? Tell us. No email needed, and you can stay anonymous.</span>
            </p>

            <div className="feedback-field">
              <label htmlFor="feedback-name">Your name</label>
              <div className="feedback-name-row">
                <input
                  id="feedback-name"
                  type="text"
                  name="name"
                  value={anonymous ? '' : name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  placeholder={anonymous ? 'Sending as Anonymous' : 'Your name'}
                  autoComplete="name"
                  disabled={anonymous}
                />
                <button
                  type="button"
                  className={`feedback-anon ${anonymous ? 'is-active' : ''}`}
                  aria-pressed={anonymous}
                  onClick={() => setAnonymous((a) => !a)}
                  title={anonymous ? 'Click to add your name' : 'Click to send without your name'}
                >
                  <IncognitoIcon /> Anonymous
                </button>
              </div>
            </div>

            <fieldset className="feedback-field">
              <legend>What’s it about?</legend>
              <div className="feedback-topics">
                {TOPICS.map((t) => (
                  <label key={t} className={`feedback-topic ${topic === t ? 'is-active' : ''}`}>
                    <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} />
                    {t}
                  </label>
                ))}
              </div>
              {topic === OTHER && (
                <input
                  type="text"
                  className="feedback-other"
                  value={otherTopic}
                  onChange={(e) => setOtherTopic(e.target.value.slice(0, 80))}
                  placeholder="Type your subject"
                  aria-label="Your subject"
                  autoFocus
                />
              )}
            </fieldset>

            <label className="feedback-field">
              <span>Message</span>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                placeholder="What should we fix, add or keep?"
                rows={6}
                required
              />
              <small className="feedback-count">{message.length} / {MAX_MESSAGE}</small>
            </label>

            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="feedback-trap" aria-hidden="true" />

            {status === 'error' && <p className="feedback-error" role="alert"><TriangleAlert size={15} /> {error}</p>}

            <button type="submit" className="feedback-submit" disabled={!message.trim() || status === 'sending'}>
              {status === 'sending' ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
