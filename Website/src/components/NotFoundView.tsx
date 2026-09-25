import { ArrowLeft } from 'lucide-react';
import { Link } from '@/components/Link';

export function NotFoundView() {
  return (
    <section className="semester-page-header section-wrap not-found">
      <span className="section-kicker">404</span>
      <h2>Page not found</h2>
      <p>This page doesn't exist, or the notes were moved. Pick a semester from the home page to find what you need.</p>
      <Link to="/" className="cta-button"><ArrowLeft size={16} /> Back to home</Link>
    </section>
  );
}
