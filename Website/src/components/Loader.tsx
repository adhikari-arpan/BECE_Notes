import { Logo } from '@/components/Logo';

interface LoaderProps {
  label?: string;
  /** 0–100; shown next to the label when known. */
  progress?: number | null;
}

/** Brand loader: logo above six nested spinning rings, with optional download percentage. */
export function Loader({ label = 'Loading…', progress = null }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <Logo className="loader-logo" />
      <div className="loader-rings">
        <div className="loader-ring">
          <div className="loader-ring">
            <div className="loader-ring">
              <div className="loader-ring">
                <div className="loader-ring">
                  <div className="loader-ring" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="loader-label">
        {label}
        {progress !== null && <strong className="loader-percent">{progress}%</strong>}
      </span>
    </div>
  );
}
