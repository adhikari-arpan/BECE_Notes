import { ArrowLeft, BarChart3, Cookie, Database, ExternalLink, FileLock2, HardDrive, Mail, Megaphone, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Link } from '@/components/Link';

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';
const EFFECTIVE_DATE = 'September 26, 2026';

export function PrivacyView() {
  return (
    <>
      <section className="semester-page-header content-page-header section-wrap">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="semester-page-title">
          <div>
            <span className="section-kicker">Legal</span>
            <h2>Privacy Policy</h2>
          </div>
        </div>
      </section>

      <section className="content-page section-wrap">
        <div className="content-page-body">
          <div className="content-page-section">
            <p className="content-page-lead">
              BECE Notes (notes.arpanadhikari7.com.np) is a free study-notes website. You don't need an account, and we
              don't ask for your name, email or any other personal details to use it.
            </p>
            <p>
              This page explains what little information is collected when you visit, why, and the choices you have.
              Effective date: <strong>{EFFECTIVE_DATE}</strong>.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Database size={18} /> Visit counters</h3>
            <p>
              The site shows how many visitors and page visits it has had. To count them, your browser sends an anonymous
              “+1” to a Firebase Realtime Database (a Google service). Only the running totals are stored — no names, no IP
              addresses and nothing that identifies you. To avoid double-counting, your browser remembers the time it was
              last counted (see “Stored on your device” below).
            </p>
          </div>

          <div className="content-page-section">
            <h3><HardDrive size={18} /> Stored on your device</h3>
            <p>
              Some features save small pieces of information in your own browser (local storage). This data stays on your
              device, is never sent to us, and you can delete it any time by clearing your browser's site data:
            </p>
            <ul>
              <li><ShieldCheck size={16} /> Your light/dark theme choice and file-list width</li>
              <li><ShieldCheck size={16} /> Highlights you make on PDFs (kept only in this browser)</li>
              <li><ShieldCheck size={16} /> The time of your last counted visit, for the visit counter</li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><BarChart3 size={18} /> Analytics</h3>
            <p>To understand how the site is used and keep it fast, we use:</p>
            <ul>
              <li>
                <ShieldCheck size={16} />
                <span>
                  <strong>Google Analytics</strong> (via Firebase), which uses cookies to collect information such as pages
                  visited, time on site, approximate location (country/city), device and browser. Google processes this data
                  under the{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>.
                  You can opt out with the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">Google Analytics opt-out browser add-on</a>.
                </span>
              </li>
              <li>
                <ShieldCheck size={16} />
                <span>
                  <strong>Vercel Web Analytics and Speed Insights</strong>, which measure page views and loading speed without
                  cookies and without identifying individual visitors.
                </span>
              </li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><Megaphone size={18} /> Advertising</h3>
            <p>This site may show ads served by Google AdSense to help cover its costs. When ads are shown:</p>
            <ul>
              <li>
                <ShieldCheck size={16} />
                <span>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.</span>
              </li>
              <li>
                <ShieldCheck size={16} />
                <span>
                  Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to
                  this site and/or other sites on the Internet.
                </span>
              </li>
              <li>
                <ShieldCheck size={16} />
                <span>
                  You may opt out of personalized advertising by visiting{' '}
                  <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">Google Ads Settings</a>. You can
                  also opt out of some third-party vendors' use of cookies for personalized advertising at{' '}
                  <a href="https://www.aboutads.info/choices" target="_blank" rel="noreferrer">www.aboutads.info</a>.
                </span>
              </li>
              <li>
                <ShieldCheck size={16} />
                <span>
                  Learn more in{' '}
                  <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                    How Google uses information from sites that use its services
                  </a>.
                </span>
              </li>
            </ul>
            <p>When ads are shown, visitors from the European Economic Area, the UK and Switzerland are asked for consent before personalized ads are shown.</p>
          </div>

          <div className="content-page-section">
            <h3><Cookie size={18} /> Cookies</h3>
            <p>
              The site itself does not set cookies. Cookies are only set by Google Analytics and, when ads are shown, by
              Google and its advertising partners, as described above. You can block or delete cookies in your browser
              settings; the notes will still work, though some statistics and ads may not.
            </p>
          </div>

          <div className="content-page-section">
            <h3><ExternalLink size={18} /> Third-party services</h3>
            <p>
              To load and display notes, your browser connects directly to these services, which may log basic technical
              information such as your IP address under their own privacy policies:
            </p>
            <ul>
              <li><ShieldCheck size={16} /> <span><strong>GitHub</strong> — note files are stored in and loaded from a public GitHub repository.</span></li>
              <li><ShieldCheck size={16} /> <span><strong>Vercel</strong> — hosts the website.</span></li>
              <li><ShieldCheck size={16} /> <span><strong>Microsoft Office viewer</strong> — shows previews of Word and PowerPoint files.</span></li>
              <li><ShieldCheck size={16} /> <span><strong>Google Fonts</strong> — provides the fonts used on the site.</span></li>
              <li><ShieldCheck size={16} /> <span><strong>eSewa</strong> — optional “Buy me a Chiya” tips are paid directly in the eSewa app by scanning a QR code. This site never sees or stores any payment details.</span></li>
            </ul>
          </div>

          <div className="content-page-section">
            <h3><FileLock2 size={18} /> Downloads</h3>
            <p>
              When you download or print a PDF or image, a small “Downloaded from notes.arpanadhikari7.com.np” line is added
              to it. This happens entirely inside your browser; the file is not sent to us.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Users size={18} /> Children</h3>
            <p>
              This site is intended for university students. We do not knowingly collect personal information from children
              under 13.
            </p>
          </div>

          <div className="content-page-section">
            <h3><RefreshCw size={18} /> Changes to this policy</h3>
            <p>
              If this policy changes — for example when a new service is added — this page will be updated and the effective
              date above will change.
            </p>
          </div>

          <div className="content-page-section">
            <h3><Mail size={18} /> Contact</h3>
            <p>
              Questions about this policy or your data: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
