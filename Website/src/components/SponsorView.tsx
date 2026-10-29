import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Check, FileStack, Mail, Repeat, Sparkles, Target } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { CountUp } from '@/components/CountUp';
import { Link } from '@/components/Link';
import { SpotPreview } from '@/components/SponsorSpots';
import { DownloadPitch } from '@/components/DownloadPitch';
import { loadAnalytics, type AnalyticsData } from '@/content/analytics';
import { SITE_LIBRARY, SPONSOR_EMAIL, SPONSOR_TIERS, sponsorMailto, tierPrice } from '@/content/sponsor';
import './SponsorView.css';

const WHY = [
  { icon: Target, title: 'A focused audience', text: 'Every visitor is a Pokhara University engineering student in Nepal. No wasted reach.' },
  { icon: BookOpen, title: 'High attention', text: 'Students come to study: reading notes, practicing past papers, checking their CGPA.' },
  { icon: Sparkles, title: 'A clean, trusted site', text: 'No pop-ups or ad clutter. One clearly marked sponsor stands out instead of competing.' },
  { icon: Repeat, title: 'An audience that renews', text: 'The notes are used batch after batch, and students return every exam season.' },
];

/** /sponsor: unlisted (no links from the public site, noindex). The page to send a company. */
export function SponsorView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  useEffect(() => {
    loadAnalytics().then(setData, () => setData(null));
  }, []);
  const last30 = data?.daily.slice(-30) ?? [];
  const v30 = last30.reduce((t, d) => t + d.visitors, 0);
  const perDay = last30.length ? Math.round(v30 / last30.length) : null;

  return (
    <>
      <section className="semester-page-header section-wrap pqi-header">
        <PageHero
          title={<>Sponsor <em>BECE Vault</em></>}
          kicker="Partner with BECE Vault"
          lead="Reach Pokhara University engineering students where they study."
        />
      </section>

      <section className="section-wrap sv-page">
        {/* Live reach */}
        <div className="sv-stats">
          <Stat label="Visitors so far" value={data?.visitors ?? null} />
          <Stat label="Visitors, last 30 days" value={data ? v30 : null} />
          <Stat label="Visitors a day" value={perDay} />
          <Stat label="Page visits so far" value={data?.pageViews ?? null} />
          <Link to="/analytics" className="sv-stats-link"><BarChart3 size={15} /> Live analytics <ArrowRight size={14} /></Link>
        </div>

        {/* Tiers */}
        <div className="sv-block">
          <span className="section-kicker">Sponsorship tiers</span>
          <h2>Pick how you want to <em>show up</em></h2>
          <p className="sv-lead">Each tier adds one spot to the ones before it; the picture shows where it appears. Monthly or semester-long, and every tier can be tailored.</p>
          <div className="sv-tiers">
            {SPONSOR_TIERS.map((t, i) => (
              <div key={t.id} className={`sv-tier ${t.featured ? 'is-featured' : ''}`}>
                {t.featured && <span className="sv-tier-badge">Recommended</span>}
                <SpotPreview spot={t.spot} />
                <span className="sv-tier-step">Tier {i + 1}</span>
                <strong className="sv-tier-name">{t.name}</strong>
                <span className="sv-tier-tag">{t.tagline}</span>
                <span className="sv-tier-price">{tierPrice(t)}{t.price !== null && <small> / month</small>}</span>
                <ul>{t.includes.map((i) => <li key={i}><Check size={14} /> {i}</li>)}</ul>
                <a className="sv-tier-cta" href={sponsorMailto(`BECE Vault sponsorship: ${t.name}`)}>Ask about {t.name}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Why */}
        <div className="sv-block">
          <span className="section-kicker">Why BECE Vault</span>
          <h2>Students come here to <em>study</em></h2>
          <p className="sv-lead">
            BECE Vault is the free notes library for Pokhara University BE Computer Engineering students: notes, past exam
            papers, syllabus, study guides and a CGPA calculator for all 8 semesters. Students rely on it before mid-terms
            and finals, when they need notes and past papers most.
          </p>
          <div className="sv-why">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div key={title} className="sv-why-item">
                <Icon size={18} />
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's on the site + contact */}
        <div className="sv-contact">
          <div>
            <span className="section-kicker">Let’s talk</span>
            <h2>Put your brand in front of <em>future engineers</em></h2>
            <p>Email Arpan Adhikari, founder of BECE Vault. You can also download a two-page pitch with the live numbers to share with your team.</p>
            <div className="sv-contact-actions">
              <a className="sv-btn sv-btn-primary" href={sponsorMailto()}><Mail size={15} /> {SPONSOR_EMAIL}</a>
              <DownloadPitch data={data} className="sv-btn" />
              <Link to="/analytics" className="sv-btn">View live analytics <ArrowRight size={14} /></Link>
            </div>
          </div>
          <dl className="sv-library">
            <div><dt><BookOpen size={14} /> Note files</dt><dd>{SITE_LIBRARY.files.toLocaleString('en-US')}</dd></div>
            <div><dt><FileStack size={14} /> Past papers</dt><dd>{SITE_LIBRARY.papers.toLocaleString('en-US')}</dd></div>
            <div><dt>Study guides</dt><dd>{SITE_LIBRARY.guides}</dd></div>
            <div><dt>Semesters</dt><dd>8</dd></div>
          </dl>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="sv-stat">
      <strong>{value === null ? <span className="sv-skeleton" aria-label="Loading" /> : <CountUp value={value} durationMs={1100} />}</strong>
      <span>{label}</span>
    </div>
  );
}
