import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Check, Code2, Copy, Database, ExternalLink, FileStack, Mail, RefreshCw, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { CountUp } from '@/components/CountUp';
import { Loader } from '@/components/Loader';
import { DownloadPitch } from '@/components/DownloadPitch';
import { Link } from '@/components/Link';
import { DB_HOST, loadAnalytics, nepalToday, rawCounterUrl, type AnalyticsData, type DayCount, type Row } from '@/content/analytics';
import { BREAKDOWNS_SINCE, COUNTING_SINCE } from '@/content/visits';
import { SITE_LIBRARY } from '@/content/sponsor';
import './AnalyticsView.css';

const CONTACT_EMAIL = 'adhikariarpan2063@gmail.com';
const SITE = 'notes.arpanadhikari7.com.np';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const dayLabel = (date: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
const sum = (days: DayCount[], key: 'visitors' | 'pageViews') => days.reduce((t, d) => t + d[key], 0);
/** A "nice" axis top: 1, 2, 2.5 or 5 × 10^n just above the largest value. */
const niceTop = (max: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, max)));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((v) => v >= max) ?? max;
};
/**
 * A smooth SVG path through points on a 0–100 × 0–100 box (monotone cubic: it never overshoots,
 * so the curve doesn't dip below zero or above a peak that isn't there).
 */
function linePath(ys: number[], top: number): string {
  const pts = ys.map((y, i) => [ys.length === 1 ? 50 : ((i + 0.5) / ys.length) * 100, 100 - (y / top) * 100]);
  if (pts.length < 3) return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const n = pts.length;
  const slope = pts.slice(0, -1).map(([x, y], i) => (pts[i + 1][1] - y) / (pts[i + 1][0] - x));
  const tan = pts.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    return slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) { tan[i] = 0; tan[i + 1] = 0; continue; }
    const a = tan[i] / slope[i];
    const b = tan[i + 1] / slope[i];
    const h = Math.hypot(a, b);
    if (h > 3) { tan[i] = (3 / h) * a * slope[i]; tan[i + 1] = (3 / h) * b * slope[i]; }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dx = (x1 - x0) / 3;
    d += ` C${x0 + dx},${y0 + tan[i] * dx} ${x1 - dx},${y1 - tan[i + 1] * dx} ${x1},${y1}`;
  }
  return d;
}

/** The library itself (from the notes manifest), for the "what's on the site" panel. */
const library = SITE_LIBRARY;

/** /analytics: unlisted (no links anywhere, noindex). Live numbers for the owner and for sponsors. */
export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    loadAnalytics()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Couldn’t load the counters.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  return (
    <>
      <section className="semester-page-header section-wrap pqi-header">
        <PageHero
          title={<>Site <em>Analytics</em></>}
          kicker="BECE Vault · Live numbers"
          lead={`Real, anonymous visit counts for ${SITE}, counted since ${COUNTING_SINCE}.`}
        />
      </section>

      <section className="section-wrap an-page">
        {error && (
          <div className="an-error" role="alert">
            <p>{error}</p>
            <button onClick={load}><RefreshCw size={14} /> Try again</button>
          </div>
        )}
        {!data && loading && <div className="an-loading"><Loader label="Reading the counters…" /></div>}
        {data && <Dashboard data={data} loading={loading} onRefresh={load} />}
      </section>
    </>
  );
}

function Dashboard({ data, loading, onRefresh }: { data: AnalyticsData; loading: boolean; onRefresh: () => void }) {
  const { daily } = data;
  const today = daily[daily.length - 1];
  const last30 = daily.slice(-30);
  const prev30 = daily.length >= 60 ? daily.slice(-60, -30) : null;
  const last7 = daily.slice(-7);
  const prev7 = daily.length >= 14 ? daily.slice(-14, -7) : null;
  const avgDaily = last30.length ? Math.round(sum(last30, 'visitors') / last30.length) : 0;
  const busiest = daily.reduce<DayCount | null>((b, d) => (!b || d.visitors > b.visitors ? d : b), null);
  const pagesPerVisit = data.visitors ? data.pageViews / data.visitors : 0;
  const change = (now: DayCount[], before: DayCount[] | null) => {
    if (!before) return null;
    const a = sum(now, 'visitors');
    const b = sum(before, 'visitors');
    return b ? Math.round(((a - b) / b) * 100) : null;
  };
  const change7 = change(last7, prev7);
  const change30 = change(last30, prev30);
  const spark = (key: 'visitors' | 'pageViews', n: number) => daily.slice(-n).map((d) => d[key]);
  // Running total of visitors: what was counted before the daily counters began, plus each day since.
  const before = Math.max(0, data.visitors - sum(daily, 'visitors'));
  const cumulative = daily.reduce<number[]>((acc, d) => [...acc, (acc[acc.length - 1] ?? before) + d.visitors], []);

  return (
    <>
      <div className="an-toolbar">
        <span className="an-live">
          <span className="an-dot" aria-hidden="true" /> Live · loaded {data.loadedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          <a
            href="#verify"
            className="an-verified"
            onClick={(e) => {
              // Open the (collapsed) verify section, then scroll to it.
              e.preventDefault();
              const el = document.getElementById('verify') as HTMLDetailsElement | null;
              if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            }}
          >
            <ShieldCheck size={13} /> Verifiable data
          </a>
        </span>
        <div className="an-toolbar-actions">
          <CopySummary data={data} avgDaily={avgDaily} />
          <DownloadPitch data={data} />
          <button className="an-btn" onClick={onRefresh} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : undefined} /> Refresh</button>
        </div>
      </div>

      {/* Headline numbers, each with its own recent trend */}
      <div className="an-tiles">
        <Tile label="Total visitors" value={data.visitors} note={`since ${COUNTING_SINCE}`} spark={cumulative.slice(-30)} big />
        <Tile label="Total page visits" value={data.pageViews} note={`${pagesPerVisit.toFixed(1)} pages per visit`} spark={spark('pageViews', 30)} big />
        <Tile label="Visitors, last 30 days" value={sum(last30, 'visitors')} change={change30} note={change30 === null ? 'daily' : 'vs previous 30 days'} spark={spark('visitors', 30)} />
        <Tile label="Visitors, last 7 days" value={sum(last7, 'visitors')} change={change7} note={change7 === null ? 'daily' : 'vs previous 7 days'} spark={spark('visitors', 7)} />
        <Tile label="Average per day" value={avgDaily} note="visitors, last 30 days" />
        <Tile label="Today" value={today?.visitors ?? 0} note={`visitors · ${fmt(today?.pageViews ?? 0)} page visits`} />
        {busiest && <Tile label="Busiest day" value={busiest.visitors} note={dayLabel(busiest.date, { weekday: 'short', day: 'numeric', month: 'short' })} />}
      </div>

      <DailyChart daily={daily} />

      <div className="an-grid">
        <Panel title="Growth" note="Total visitors over time">
          <GrowthChart daily={daily} cumulative={cumulative} />
        </Panel>
        <Panel title="Busiest days of the week" note="Average visitors per weekday">
          <WeekdayChart daily={daily} />
        </Panel>
        <Panel title="Where visits go" note={`Page visits by part of the site · since ${BREAKDOWNS_SINCE}`}>
          <BarList rows={data.sections} unit="page visits" />
        </Panel>
        <Panel title="How people find the site" note={`Visitors by source · since ${BREAKDOWNS_SINCE}`}>
          <BarList rows={data.sources} unit="visitors" limit={8} />
        </Panel>
        <Panel title="Devices" note={`Visitors · since ${BREAKDOWNS_SINCE}`}>
          <ShareBar rows={data.devices} unit="visitors" />
        </Panel>
        <Panel title="Most-read subjects" note={`Subject page visits · since ${BREAKDOWNS_SINCE}`}>
          <BarList rows={data.subjects.map((s) => ({ ...s, label: `${s.label} · ${s.semester}` }))} unit="page visits" limit={8} />
        </Panel>
      </div>

      {/* For sponsors: what's on the site and who it's for */}
      <div className="an-grid an-grid-bottom">
        <Panel title="What’s on the site">
          <dl className="an-library">
            <div><dt><BookOpen size={15} /> Note files</dt><dd>{fmt(library.files)}</dd></div>
            <div><dt><FileStack size={15} /> Past exam papers</dt><dd>{fmt(library.papers)}</dd></div>
            <div><dt>Subjects with notes</dt><dd>{library.subjects}</dd></div>
            <div><dt>Study guides</dt><dd>{library.guides}</dd></div>
            <div><dt>Semesters covered</dt><dd>8</dd></div>
            <div><dt>Contributors</dt><dd>{library.contributors}</dd></div>
          </dl>
        </Panel>
        <div className="an-sponsor">
          <span className="section-kicker">Reach PU engineering students</span>
          <h2>Sponsor <em>BECE Vault</em></h2>
          <p>
            BECE Vault is the free notes library used by Pokhara University BE Computer Engineering students across Nepal:
            notes, past papers, syllabus and a CGPA calculator for all 8 semesters. A single, clearly marked sponsor spot
            reaches students right when they study, without pop-ups or clutter.
          </p>
          <div className="an-sponsor-actions">
            <Link to="/sponsor" className="an-sponsor-cta">See sponsor spots and tiers <ArrowRight size={15} /></Link>
            <a className="an-sponsor-mail" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Sponsoring BECE Vault')}`}><Mail size={14} /> {CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>

      <p className="an-footnote">
        About these numbers: visitors are counted once per study session, not per click, and a page visit is every page
        opened. Everything is anonymous, with no names, IP addresses or cookies. Breakdowns by section, subject, device and
        source began on {BREAKDOWNS_SINCE}.
      </p>

      <Verify />
    </>
  );
}

function Tile({ label, value, note, change, spark, big }: { label: string; value: number; note?: string; change?: number | null; spark?: number[]; big?: boolean }) {
  return (
    <div className={`an-tile ${big ? 'an-tile-big' : ''}`}>
      <span className="an-tile-label">{label}</span>
      <strong><CountUp value={value} durationMs={1000} /></strong>
      <span className="an-tile-note">
        {change != null && (
          <span className={`an-change ${change >= 0 ? 'is-up' : 'is-down'}`}>
            {change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
        {note}
      </span>
      {spark && spark.length > 1 && <Sparkline values={spark} />}
    </div>
  );
}

/** A tiny trend line with a soft fill (no axis: the tile's number is the reading). */
function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${92 - ((v - min) / span) * 84}`);
  return (
    <svg className="an-spark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="an-spark-area" d={`M0,100 L${pts.join(' L')} L100,100 Z`} />
      <path className="an-spark-line" d={`M${pts.join(' L')}`} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Panel({ title, note, wide, children }: { title: string; note?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`an-panel ${wide ? 'an-panel-wide' : ''}`}>
      <div className="an-panel-head"><h3>{title}</h3>{note && <span>{note}</span>}</div>
      {children}
    </div>
  );
}

const Empty = () => <p className="an-empty">Collecting data. Check back in a few days.</p>;

/** Ranked horizontal bars, largest first, with the value and share as text (the bar only repeats it). */
function BarList({ rows, unit, limit }: { rows: Row[]; unit: string; limit?: number }) {
  const shown = rows.filter((r) => r.value > 0);
  if (!shown.length) return <Empty />;
  const total = shown.reduce((t, r) => t + r.value, 0);
  const max = shown[0].value;
  const list = limit ? shown.slice(0, limit) : shown;
  const rest = limit ? shown.slice(limit).reduce((t, r) => t + r.value, 0) : 0;
  return (
    <ol className="an-bars">
      {list.map((r, i) => (
        <li key={r.key} title={`${r.label}: ${fmt(r.value)} ${unit} (${pct(r.value, total)}%)`}>
          <span className="an-bar-rank">{i + 1}</span>
          <span className="an-bar-label">{r.label}</span>
          <span className="an-bar-value">{fmt(r.value)} <small>{pct(r.value, total)}%</small></span>
          <span className="an-bar-track"><span className="an-bar-fill" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} /></span>
        </li>
      ))}
      {rest > 0 && <li className="an-bars-rest">+ {fmt(rest)} more from other rows</li>}
    </ol>
  );
}

/** One bar split into shares (phone / computer / tablet), with a labelled legend: identity never by color alone. */
function ShareBar({ rows, unit }: { rows: Row[]; unit: string }) {
  const total = rows.reduce((t, r) => t + r.value, 0);
  if (!total) return <Empty />;
  // Color follows the device, not its rank.
  const color = (key: string) => `var(--an-cat-${['mobile', 'desktop', 'tablet'].indexOf(key) + 1})`;
  const order = rows.filter((r) => r.value > 0);
  const lead = order[0];
  return (
    <div className="an-share">
      <p className="an-share-lead"><strong>{pct(lead.value, total)}%</strong> of visitors use a {lead.label.toLowerCase()}</p>
      <div className="an-share-bar" role="img" aria-label={order.map((r) => `${r.label} ${pct(r.value, total)}%`).join(', ')}>
        {order.map((r) => <span key={r.key} style={{ width: `${(r.value / total) * 100}%`, background: color(r.key) }} title={`${r.label}: ${fmt(r.value)} ${unit}`} />)}
      </div>
      <ul className="an-legend">
        {order.map((r) => (
          <li key={r.key}><span className="an-swatch" style={{ background: color(r.key) }} />{r.label}<b>{pct(r.value, total)}%</b><small>{fmt(r.value)}</small></li>
        ))}
      </ul>
    </div>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Average visitors per weekday, in calendar order; the busiest one is named, not colored differently. */
function WeekdayChart({ daily }: { daily: DayCount[] }) {
  // Today isn't over yet, so it would pull its weekday's average down.
  const done = daily.slice(0, -1);
  const avgs = WEEKDAYS.map((_, i) => {
    const days = done.filter((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === i);
    return days.length ? sum(days, 'visitors') / days.length : 0;
  });
  if (!avgs.some((v) => v > 0)) return <Empty />;
  const top = niceTop(Math.max(...avgs));
  const best = avgs.indexOf(Math.max(...avgs));
  return (
    <div className="an-week">
      <div className="an-week-cols">
        {avgs.map((v, i) => (
          <div key={WEEKDAYS[i]} className="an-week-col" title={`${WEEKDAYS[i]}: ${fmt(v)} visitors on average`}>
            <span className="an-week-val">{fmt(v)}</span>
            <span className="an-week-bar" style={{ height: `${(v / top) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="an-week-x">{WEEKDAYS.map((d, i) => <span key={d} className={i === best ? 'is-best' : undefined}>{d}</span>)}</div>
      <p className="an-week-note"><strong>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][best]}</strong> is the busiest day, with about {fmt(avgs[best])} visitors.</p>
    </div>
  );
}

/** Running total of visitors as a filled line, labelled at both ends. */
function GrowthChart({ daily, cumulative }: { daily: DayCount[]; cumulative: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (cumulative.length < 2) return <Empty />;
  const top = niceTop(cumulative[cumulative.length - 1]);
  const d = linePath(cumulative, top);
  const first = cumulative[0];
  const last = cumulative[cumulative.length - 1];
  const x = (i: number) => ((i + 0.5) / cumulative.length) * 100;
  return (
    <div className="an-growth">
      <div className="an-plot an-plot-sm" onMouseLeave={() => setHover(null)}>
        <Gridlines top={top} />
        <svg className="an-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="an-area" d={`${d} L${x(cumulative.length - 1)},100 L${x(0)},100 Z`} />
          <path className="an-line an-line-primary" d={d} vectorEffect="non-scaling-stroke" />
        </svg>
        {hover !== null && <span className="an-crosshair" style={{ left: `${x(hover)}%` }} />}
        <HoverColumns count={cumulative.length} onHover={setHover} label={(i) => `${dayLabel(daily[i].date)}: ${fmt(cumulative[i])} visitors in total`} />
        {hover !== null && (
          <div className="an-tip" style={{ left: `${x(hover)}%` }} role="status">
            <strong>{dayLabel(daily[hover].date, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
            <span><b>{fmt(cumulative[hover])}</b> visitors in total</span>
          </div>
        )}
      </div>
      <div className="an-chart-x" aria-hidden="true"><span>{dayLabel(daily[0].date)}</span><span>{dayLabel(daily[daily.length - 1].date)}</span></div>
      <p className="an-week-note">From <strong>{fmt(first)}</strong> to <strong>{fmt(last)}</strong> visitors: <strong>+{fmt(last - first)}</strong> in {cumulative.length} days.</p>
    </div>
  );
}

function Gridlines({ top }: { top: number }) {
  return (
    <div className="an-chart-grid" aria-hidden="true">
      {[1, 0.5, 0].map((f) => <span key={f} style={{ bottom: `${f * 100}%` }}><em>{fmt(top * f)}</em></span>)}
    </div>
  );
}

/** Invisible full-height columns over a plot: bigger hover and focus targets than the marks themselves. */
function HoverColumns({ count, onHover, label }: { count: number; onHover: (i: number | null) => void; label: (i: number) => string }) {
  return (
    <div className="an-hover-cols">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} tabIndex={0} aria-label={label(i)} onMouseEnter={() => onHover(i)} onFocus={() => onHover(i)} onBlur={() => onHover(null)} />
      ))}
    </div>
  );
}

const RANGES = [
  { key: 14, label: '14 days' },
  { key: 30, label: '30 days' },
  { key: 0, label: 'All' },
] as const;

/** A daily line for one measure at a time (visitors or page visits: one axis, never two). */
function DailyChart({ daily }: { daily: DayCount[] }) {
  const [metric, setMetric] = useState<'visitors' | 'pageViews'>('visitors');
  const [range, setRange] = useState<number>(30);
  const [hover, setHover] = useState<number | null>(null);
  const days = range ? daily.slice(-range) : daily;
  const values = days.map((d) => d[metric]);
  const top = niceTop(Math.max(1, ...values));
  const peak = values.indexOf(Math.max(...values));
  const metricLabel = metric === 'visitors' ? 'visitors' : 'page visits';
  const total = values.reduce((t, v) => t + v, 0);
  const x = (i: number) => ((i + 0.5) / days.length) * 100;
  const pts = values.map((v, i) => `${x(i)},${100 - (v / top) * 100}`);

  if (!days.length) return null;
  const h = hover !== null ? days[hover] : null;
  return (
    <div className="an-panel an-panel-wide an-chart-panel">
      <div className="an-panel-head an-chart-head">
        <div>
          <h3>Daily {metricLabel}</h3>
          <span>{fmt(total)} {metricLabel} from {dayLabel(days[0].date)} to {dayLabel(days[days.length - 1].date)} · Nepal time · today is still counting</span>
        </div>
        <div className="an-filters">
          <div className="an-seg" role="group" aria-label="Measure">
            <button aria-pressed={metric === 'visitors'} onClick={() => setMetric('visitors')}>Visitors</button>
            <button aria-pressed={metric === 'pageViews'} onClick={() => setMetric('pageViews')}>Page visits</button>
          </div>
          <div className="an-seg" role="group" aria-label="Range">
            {RANGES.map((r) => <button key={r.key} aria-pressed={range === r.key} onClick={() => setRange(r.key)}>{r.label}</button>)}
          </div>
        </div>
      </div>

      <div className="an-plot" onMouseLeave={() => setHover(null)}>
        <Gridlines top={top} />
        {/* A line with a soft fill, like Vercel's; the last stretch is dashed because today isn't over. */}
        <svg className="an-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="an-area" d={`M${x(0)},100 L${pts.join(' L')} L${x(days.length - 1)},100 Z`} />
          <path className="an-line an-line-primary" d={`M${(days.length > 1 ? pts.slice(0, -1) : pts).join(' L')}`} vectorEffect="non-scaling-stroke" />
          {days.length > 1 && <path className="an-line an-line-primary an-line-today" d={`M${pts[pts.length - 2]} L${pts[pts.length - 1]}`} vectorEffect="non-scaling-stroke" />}
        </svg>
        {hover === null && <span className="an-col-peak an-line-peak" style={{ left: `${x(peak)}%`, bottom: `${(values[peak] / top) * 100}%` }}>{fmt(values[peak])}</span>}
        {hover !== null && (
          <>
            <span className="an-crosshair" style={{ left: `${x(hover)}%` }} />
            <span className="an-point" style={{ left: `${x(hover)}%`, bottom: `${(values[hover] / top) * 100}%` }} />
          </>
        )}
        <HoverColumns
          count={days.length}
          onHover={setHover}
          label={(i) => `${dayLabel(days[i].date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${fmt(values[i])} ${metricLabel}`}
        />
        {h && hover !== null && (
          <div className="an-tip" style={{ left: `${x(hover)}%` }} role="status">
            <strong>{dayLabel(h.date, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
            <span><b>{fmt(h.visitors)}</b> visitors</span>
            <span><b>{fmt(h.pageViews)}</b> page visits</span>
          </div>
        )}
      </div>
      <div className="an-chart-x" aria-hidden="true">
        <span>{dayLabel(days[0].date)}</span>
        {days.length > 2 && <span>{dayLabel(days[Math.floor(days.length / 2)].date)}</span>}
        <span>{dayLabel(days[days.length - 1].date)}</span>
      </div>

      <details className="an-table">
        <summary>Show as table</summary>
        <table>
          <thead><tr><th>Date</th><th className="num">Visitors</th><th className="num">Page visits</th></tr></thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.date}><td>{dayLabel(d.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td><td className="num">{fmt(d.visitors)}</td><td className="num">{fmt(d.pageViews)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

const REPO = 'https://github.com/adhikari-arpan/BECE_Notes/blob/main/Website/src/content';

/** How anyone (e.g. a sponsor) can check these numbers without trusting this page. */
function Verify() {
  const today = `bece-notes-${nepalToday()}`;
  const raw = [
    { label: 'Total visitors', href: rawCounterUrl('bece-notes', 'visitors') },
    { label: 'Total page visits', href: rawCounterUrl('bece-notes', 'pageviews') },
    { label: 'Today’s visitors', href: rawCounterUrl(today, 'visitors') },
  ];
  return (
    <details className="an-verify" id="verify">
      <summary>
        <ShieldCheck size={16} />
        <span><strong>How to verify these numbers</strong><small>Every number is read live from the counters. Check them yourself.</small></span>
      </summary>
      <div className="an-verify-grid">
        <div className="an-verify-item">
          <Database size={18} />
          <h3>Straight from Google Firebase</h3>
          <p>The counts are stored in a Google Firebase database (<code>{DB_HOST}</code>), not on this site. Open a raw counter and compare it with the number above:</p>
          <ul>{raw.map((r) => <li key={r.label}><a href={r.href} target="_blank" rel="noreferrer">{r.label} <ExternalLink size={12} /></a></li>)}</ul>
        </div>
        <div className="an-verify-item">
          <ShieldCheck size={18} />
          <h3>Counts can only go up by one</h3>
          <p>
            The database’s security rules accept exactly one change from a browser: adding 1. Setting a number, adding
            more than 1, lowering or deleting a count is refused, so counts can’t be inflated from the website.
          </p>
        </div>
        <div className="an-verify-item">
          <Code2 size={18} />
          <h3>Open-source counting</h3>
          <p>The code that counts visits, and the code that reads them for this page, is public on GitHub:</p>
          <ul>
            <li><a href={`${REPO}/visits.ts`} target="_blank" rel="noreferrer">How visits are counted <ExternalLink size={12} /></a></li>
            <li><a href={`${REPO}/analytics.ts`} target="_blank" rel="noreferrer">How this page reads them <ExternalLink size={12} /></a></li>
          </ul>
        </div>
      </div>
      <p className="an-verify-note">
        The site is also measured by Vercel Web Analytics and Google Search Console. Screenshots or read-only access can be
        shared on request: <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('BECE Vault analytics')}`}>{CONTACT_EMAIL}</a>.
      </p>
    </details>
  );
}

/** Copies a short, shareable summary (e.g. to paste into a message to a sponsor). */
function CopySummary({ data, avgDaily }: { data: AnalyticsData; avgDaily: number }) {
  const [copied, setCopied] = useState(false);
  const last30 = sum(data.daily.slice(-30), 'visitors');
  const text = [
    `BECE Vault (${SITE}): free notes library for Pokhara University BE Computer Engineering students`,
    `• ${fmt(data.visitors)} visitors and ${fmt(data.pageViews)} page visits since ${COUNTING_SINCE}`,
    `• ${fmt(last30)} visitors in the last 30 days (about ${fmt(avgDaily)} a day)`,
    `• ${fmt(library.files)} note files, ${fmt(library.papers)} past exam papers, ${library.guides} study guides, all 8 semesters`,
    `Live numbers: https://${SITE}/analytics`,
  ].join('\n');
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };
  return <button className="an-btn" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy summary'}</button>;
}
