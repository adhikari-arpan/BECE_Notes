import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Coffee, Copy, Download, Heart, Minus, Plus, X } from 'lucide-react';
import {
  CUP_PRESETS, CUP_PRICE, ESEWA_ID, ESEWA_NAME, ESEWA_QR, MAX_CUPS,
  closeTipJar, dismissTipNudge, formatRs, openTipJar, useTipJar,
} from '@/content/tipJar';

/** A steaming cup of chiya, drawn in SVG so it follows the theme. */
export function ChiyaCup({ size = 64, steam = true }: { size?: number; steam?: boolean }) {
  return (
    <svg className="chiya-cup" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {steam && (
        <g className="chiya-steam" fill="none" strokeWidth="2.4" strokeLinecap="round">
          <path d="M24 16c-3-4 3-6 0-10" />
          <path d="M32 16c-3-4 3-6 0-10" />
          <path d="M40 16c-3-4 3-6 0-10" />
        </g>
      )}
      <path className="chiya-handle" d="M46 28h4a7 7 0 0 1 0 14h-5" fill="none" strokeWidth="4" />
      <path className="chiya-body" d="M14 22h34l-4 28a6 6 0 0 1-6 5H24a6 6 0 0 1-6-5z" />
      <path className="chiya-tea" d="M16.4 30h29.2l-2.9 19.4a4 4 0 0 1-4 3.4H23.3a4 4 0 0 1-4-3.4z" />
      <ellipse className="chiya-rim" cx="31" cy="22" rx="17" ry="3.2" />
      <rect className="chiya-saucer" x="8" y="56" width="46" height="4" rx="2" />
    </svg>
  );
}

type Step = 'choose' | 'pay' | 'thanks';

export function TipJar() {
  const { open, nudge } = useTipJar();
  const [step, setStep] = useState<Step>('choose');
  const [cups, setCups] = useState(2);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const total = cups * CUP_PRICE;

  // Fresh start each time it opens; close on Esc; keep focus inside the dialog.
  useEffect(() => {
    if (!open) return;
    setStep('choose');
    setCopied(false);
    const previous = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => dialogRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTipJar();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('tip-jar-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('tip-jar-open');
      previous?.focus?.();
    };
  }, [open]);

  const setCupCount = (n: number) => setCups(Math.min(MAX_CUPS, Math.max(1, Math.round(n) || 1)));

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ESEWA_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the ID is visible to copy by hand.
    }
  };

  return (
    <>
      {nudge && !open && (
        <div className="tip-nudge" role="status">
          <ChiyaCup size={34} />
          <p>Found this note useful? <strong>Buy me a chiya</strong> and keep the notes coming.</p>
          <button className="tip-nudge-cta" onClick={openTipJar}>Buy a chiya</button>
          <button className="tip-nudge-close" onClick={dismissTipNudge} aria-label="Dismiss"><X size={15} /></button>
        </div>
      )}

      {open && (
        <div className="tip-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeTipJar()}>
          <div className="tip-dialog" role="dialog" aria-modal="true" aria-labelledby="tip-title" tabIndex={-1} ref={dialogRef}>
            <button className="tip-close" onClick={closeTipJar} aria-label="Close"><X size={18} /></button>

            {step === 'choose' && (
              <>
                <div className="tip-hero">
                  <ChiyaCup size={72} />
                  <div>
                    <h2 id="tip-title">Buy me a Chiya</h2>
                    <p>This library is free and always will be. If it helped you study, a cup of chiya keeps it going. 🙏</p>
                  </div>
                </div>

                <div className="tip-presets" role="radiogroup" aria-label="Number of cups">
                  {CUP_PRESETS.map((n) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={cups === n}
                      className={`tip-preset ${cups === n ? 'selected' : ''}`}
                      onClick={() => setCupCount(n)}
                    >
                      <span className="tip-preset-cups" aria-hidden="true">
                        {Array.from({ length: Math.min(n, 3) }, (_, i) => <Coffee key={i} size={16} />)}
                        {n > 3 && <em>+{n - 3}</em>}
                      </span>
                      <strong>{n} {n === 1 ? 'cup' : 'cups'}</strong>
                      <small>{formatRs(n * CUP_PRICE)}</small>
                    </button>
                  ))}
                </div>

                <div className="tip-custom">
                  <span>Or choose your own</span>
                  <div className="tip-stepper">
                    <button onClick={() => setCupCount(cups - 1)} disabled={cups <= 1} aria-label="One cup less"><Minus size={16} /></button>
                    <input
                      type="number"
                      min={1}
                      max={MAX_CUPS}
                      value={cups}
                      onChange={(e) => setCupCount(Number(e.target.value))}
                      aria-label="Number of cups"
                    />
                    <button onClick={() => setCupCount(cups + 1)} disabled={cups >= MAX_CUPS} aria-label="One cup more"><Plus size={16} /></button>
                  </div>
                  <span className="tip-rate">× {formatRs(CUP_PRICE)}</span>
                </div>

                <div className="tip-total">
                  <span>{cups} {cups === 1 ? 'cup' : 'cups'} of chiya</span>
                  <strong key={total} className="tip-total-amount">{formatRs(total)}</strong>
                </div>

                <button className="tip-primary" onClick={() => setStep('pay')}>
                  Send {cups} {cups === 1 ? 'chiya' : 'chiyas'} · {formatRs(total)} <ArrowRight size={17} />
                </button>
                <p className="tip-footnote">Sent securely through eSewa. This site never sees your payment details.</p>
              </>
            )}

            {step === 'pay' && (
              <>
                <h2 id="tip-title" className="tip-pay-title">Send <span>{formatRs(total)}</span> of chiya via eSewa</h2>
                <div className="tip-pay">
                  <div className="tip-qr">
                    <img src={ESEWA_QR} alt={`eSewa QR code for ${ESEWA_NAME}`} width={220} height={220} />
                    <span>{ESEWA_NAME} · eSewa</span>
                  </div>
                  <ol className="tip-steps">
                    <li><strong>Open eSewa</strong> and tap <em>Scan</em>.</li>
                    <li><strong>Scan this QR</strong> — on a phone, tap <em>Save QR</em> and scan it from your gallery.</li>
                    <li>Enter <strong>{formatRs(total)}</strong> and confirm. Add “Chiya for BECE Notes” as remarks if you like.</li>
                  </ol>
                </div>

                <div className="tip-pay-actions">
                  <a className="tip-secondary" href={ESEWA_QR} download="esewa-qr-arpan-adhikari.png"><Download size={15} /> Save QR</a>
                  <button className="tip-secondary" onClick={copyId}>
                    {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> eSewa ID: {ESEWA_ID}</>}
                  </button>
                </div>

                <div className="tip-nav">
                  <button className="tip-back" onClick={() => setStep('choose')}><ArrowLeft size={15} /> Change cups</button>
                  <button className="tip-primary" onClick={() => setStep('thanks')}><Check size={17} /> Done, chiya sent!</button>
                </div>
              </>
            )}

            {step === 'thanks' && (
              <div className="tip-thanks">
                <div className="tip-thanks-cups" aria-hidden="true">
                  {Array.from({ length: Math.min(cups, 5) }, (_, i) => <ChiyaCup key={i} size={i === Math.floor(Math.min(cups, 5) / 2) ? 64 : 44} />)}
                </div>
                <h2 id="tip-title">Dhanyabad! 🙏</h2>
                <p>
                  Thank you for the {cups} {cups === 1 ? 'cup' : 'cups'} of chiya. Your support helps keep BECE Notes free and
                  growing for every Computer Engineering student. Happy studying!
                </p>
                <button className="tip-primary" onClick={closeTipJar}><Heart size={16} /> Back to notes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Navbar button that opens the tip jar. */
export function ChiyaButton() {
  return (
    <button className="chiya-button" onClick={openTipJar} title="Buy me a Chiya">
      <Coffee size={16} />
      <span>Buy me a Chiya</span>
    </button>
  );
}
