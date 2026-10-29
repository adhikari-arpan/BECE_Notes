import type { ReactNode } from 'react';
import { withBase } from '@/content/router';
import type { SponsorSpot } from '@/content/sponsor';
import './SponsorSpots.css';

/**
 * A small drawn mock-up of a real BECE Vault page with one sponsor spot marked, shown on each
 * tier on /sponsor. Drawn in HTML so it stays crisp and follows light/dark mode; the logo is the site's own.
 */
export function SpotPreview({ spot }: { spot: SponsorSpot }) {
  if (spot === 'home') {
    return (
      <Window path="/">
        <div className="sp-hero">
          <i className="sp-l sp-l-kicker" />
          <i className="sp-l sp-l-title" />
          <i className="sp-l sp-l-title sp-l-short" />
        </div>
        <Slot label="Your banner here" size="banner" />
        <div className="sp-cards"><i /><i /><i /><i /></div>
      </Window>
    );
  }
  if (spot === 'footer') {
    return (
      <Window path="/semester-3">
        <div className="sp-rows"><i /><i /><i /><i /></div>
        <div className="sp-footer">
          <span className="sp-footer-brand"><img src={withBase('/images/logo-small.webp')} alt="" width={10} height={10} />BECE Vault</span>
          <span className="sp-footer-credit">Supported by <Slot label="Your logo" size="chip" /></span>
        </div>
      </Window>
    );
  }
  return (
    <Window path="/past-questions/semester-3">
      <div className="sp-pq">
        <div className="sp-pq-side"><i className="is-on" /><i /><i /><i /><i /></div>
        <div className="sp-pq-main">
          <Slot label="Exam-season spotlight" size="card" />
          <div className="sp-papers"><i /><i /><i /><i /></div>
        </div>
      </div>
    </Window>
  );
}

function Window({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="sp-window" aria-hidden="true">
      <div className="sp-chrome">
        <span className="sp-dots"><i /><i /><i /></span>
        <span className="sp-url">notes.arpanadhikari7.com.np{path === '/' ? '' : path}</span>
      </div>
      <div className="sp-topbar">
        <img src={withBase('/images/logo-small.webp')} alt="" width={12} height={12} />
        <b>BECE VAULT</b>
        <span className="sp-nav"><i /><i /><i /></span>
      </div>
      <div className="sp-body">{children}</div>
    </div>
  );
}

function Slot({ label, size }: { label: string; size: 'banner' | 'chip' | 'card' }) {
  return <span className={`sp-slot sp-slot-${size}`}>{label}</span>;
}
