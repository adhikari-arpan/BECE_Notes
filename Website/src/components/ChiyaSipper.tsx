import { useEffect, useId, useRef, useState } from 'react';

/** What our chiya drinker says after each sip. */
const LINES = [
  'Aahaa, mitho xa! 😋',
  'Kadak chiya! ☕',
  'Chiya bina padhai hudaina! 📚',
  'Ekdam mitho! 🤤',
  'Yo chiya le exam pass! 💯',
  'Arko cup? 😄',
  'Dhanyabad hai! 🙏',
];

/** One sip = lift, sip, put down, say something. The SVG and the bubble share this rhythm. */
const CYCLE_MS = 4000;
const DUR = `${CYCLE_MS / 1000}s`;
// Lifted to the mouth by 25%, sipping until 55%, back down by 75%.
const KEY_TIMES = '0;0.25;0.55;0.75;1';
const EASE = '.4 0 .2 1;0 0 1 1;.4 0 .2 1;0 0 1 1';
/** Shared props for every looping animation. */
const loop = { dur: DUR, repeatCount: 'indefinite' } as const;
const moving = { ...loop, keyTimes: KEY_TIMES, calcMode: 'spline', keySplines: EASE } as const;

/** The topi's outline: wide band on the forehead, sides rising to a top that slants up to one side. */
const TOPI = 'M47 41 C47 33 49 24 52 15 Q69 10 87 22 C89 29 91 35 93 40 Q70 35 47 41 Z';

/** A glass of chiya, the way it's usually served: milk tea showing through, a lighter top, a shine. Centred on 0,0. */
export function ChiyaGlass({ steam = true }: { steam?: boolean }) {
  return (
    <>
      {steam && (
        <g className="chiya-sipper-steam" fill="none" stroke="#9aa69e" strokeWidth="1.6" strokeLinecap="round">
          <path d="M-4 -13 c-2 -3 2 -4 0 -7" />
          <path d="M3 -13 c-2 -3 2 -4 0 -7" />
        </g>
      )}
      {/* The glass */}
      <path d="M-10.5 -10 h21 l-2.2 20.2 a2 2 0 0 1 -2 1.8 h-12.6 a2 2 0 0 1 -2 -1.8 z" fill="#ffffff" fillOpacity=".4" stroke="#8fa39a" strokeWidth="1.3" strokeLinejoin="round" />
      {/* The tea inside, and its lighter surface */}
      <path d="M-9.7 -6 h19.4 l-1.7 15.6 a1.6 1.6 0 0 1 -1.6 1.4 h-12.8 a1.6 1.6 0 0 1 -1.6 -1.4 z" fill="#b8733a" />
      <ellipse cx="0" cy="-6" rx="9.7" ry="1.9" fill="#d9a066" />
      {/* Shine and rim */}
      <path d="M-7.2 -3 l1.1 12" stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="0" cy="-10" rx="10.5" ry="1.7" fill="none" stroke="#8fa39a" strokeWidth="1.1" />
    </>
  );
}

/** A small heart that floats up after the sip. */
function Heart({ x, y, delay, size = 1 }: { x: number; y: number; delay: number; size?: number }) {
  const start = 0.72 + delay;
  return (
    <g opacity="0">
      <path
        transform={`translate(${x} ${y}) scale(${size})`}
        d="M0 3 C-6 -2 -3 -7 0 -3 C3 -7 6 -2 0 3 Z"
        fill="#e5484d"
      />
      <animate attributeName="opacity" values="0;0;1;0" keyTimes={`0;${start};${start + 0.04};1`} {...loop} />
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -26" keyTimes={`0;${start};1`} {...loop} />
    </g>
  );
}

/**
 * The tip jar's thank-you scene: someone in a dhaka topi lifting a cup of chiya, sipping with
 * happy closed eyes ("sluurp~"), then a happy head wiggle, floating hearts and a line about how
 * good it is. Drawn in SVG and animated with SMIL, so it needs no images; it stays still for
 * people who prefer less motion.
 */
export function ChiyaSipper({ cups }: { cups: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState(0);
  // Unique ids for the SVG pattern, in case the scene is ever shown twice.
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    const svg = svgRef.current;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      svg?.pauseAnimations();
      return;
    }
    // Start the SVG's clock now, so the sips and the speech bubble stay in step.
    svg?.setCurrentTime(0);
    const timer = window.setInterval(() => setLine((i) => (i + 1) % LINES.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="chiya-sipper" aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 170 150" width="190" height="168">
        <defs>
          {/* Dhaka cloth: dark maroon with red/white diamonds and orange/green triangles */}
          <pattern id={`${id}-dhaka`} width="9" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <rect width="9" height="12" fill="#3d1420" />
            <path d="M4.5 0.6 L8.4 4 L4.5 7.4 L0.6 4 Z" fill="#d2403a" />
            <path d="M4.5 2.6 L5.9 4 L4.5 5.4 L3.1 4 Z" fill="#f4efe6" />
            <path d="M0 12 L2.25 8.6 L4.5 12 Z" fill="#f0a030" />
            <path d="M4.5 12 L6.75 8.6 L9 12 Z" fill="#2e8b57" />
          </pattern>
        </defs>

        {/* Neck, then daura suruwal with a waistcoat — the outfit that goes with a dhaka topi */}
        <rect x="64" y="72" width="12" height="22" rx="4" fill="#e9b88f" />
        {/* Daura: cream, with its crossover front flap and little ties */}
        <path d="M38 150 Q38 100 51 93 Q70 86 89 93 Q102 100 102 150 Z" fill="#efe6d2" stroke="#cdbfa0" strokeWidth="1" />
        <path d="M63.5 90 Q66 88 70 88 Q74 88 76.5 90" fill="none" stroke="#cdbfa0" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M64 91 Q80 104 92 124" fill="none" stroke="#bfae8a" strokeWidth="1.4" />
        <path d="M78 101 l5 1.5 M86 112 l5 1.5" stroke="#bfae8a" strokeWidth="1.3" strokeLinecap="round" />
        {/* Waistcoat: two green panels open at the front, gold buttons */}
        <path d="M38 150 Q38 101 51 94 L60 90.5 Q63 104 64 116 L63 150 Z" fill="#2f6b57" />
        <path d="M102 150 Q102 101 89 94 L80 90.5 Q77 104 76 116 L77 150 Z" fill="#2f6b57" />
        <path d="M60 90.5 Q63 104 64 116 L63 150 M80 90.5 Q77 104 76 116 L77 150" fill="none" stroke="#23513f" strokeWidth="1.2" />
        <g fill="#f0c34a">
          <circle cx="61.2" cy="122" r="1.7" />
          <circle cx="61" cy="133" r="1.7" />
          <circle cx="60.8" cy="144" r="1.7" />
        </g>
        <path d="M44 128 h8" stroke="#23513f" strokeWidth="1.4" strokeLinecap="round" />
        {/* Resting left arm: a daura sleeve and a hand */}
        <path d="M48 100 Q37 118 45 137" fill="none" stroke="#cdbfa0" strokeWidth="12" strokeLinecap="round" />
        <path d="M48 100 Q37 118 45 137" fill="none" stroke="#efe6d2" strokeWidth="10" strokeLinecap="round" />
        <circle cx="46" cy="140" r="5" fill="#f2c7a0" />

        {/* Head — gives a happy little wiggle after each sip */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 70 76;0 70 76;-7 70 76;6 70 76;-4 70 76;0 70 76;0 70 76" keyTimes="0;0.74;0.79;0.84;0.89;0.94;1" {...loop} />
          <circle cx="70" cy="54" r="22" fill="#f2c7a0" />
          <circle cx="48.5" cy="56" r="4" fill="#e9b88f" />
          <circle cx="91.5" cy="56" r="4" fill="#e9b88f" />
          <path d="M49 44 Q50 36 56 34 L56 44 Z" fill="#2b1d14" />
          <path d="M91 44 Q90 36 84 34 L84 44 Z" fill="#2b1d14" />

          {/* Ears: a soft inner curve */}
          <path d="M47 54 q2 2 0 4 M93 54 q-2 2 0 4" fill="none" stroke="#d9a07a" strokeWidth="1.2" strokeLinecap="round" />

          {/* Dhaka topi: tall, slanted, in dark dhaka cloth with rows of coloured diamonds */}
          <path d={TOPI} fill={`url(#${id}-dhaka)`} stroke="#2a0d15" strokeWidth="1" strokeLinejoin="round" />
          <path d="M69.5 13.5 Q70.5 25 70 37" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.2" />
          <path d="M47 41 Q70 35 93 40" fill="none" stroke="#2a0d15" strokeWidth="2.6" strokeLinecap="round" />

          {/* Eyebrows lift when they're happy; a little nose */}
          <g fill="none" stroke="#2b1d14" strokeWidth="1.8" strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -2;0 -2;0 0" keyTimes="0;0.7;0.74;0.94;1" {...loop} />
            <path d="M57.5 47.5 Q61.5 45 65.5 47" />
            <path d="M74.5 47 Q78.5 45 82.5 47.5" />
          </g>
          <path d="M70.5 56 Q73 60 69.5 61" fill="none" stroke="#d9a07a" strokeWidth="1.6" strokeLinecap="round" />

          {/* Cheeks blush more while sipping */}
          <g fill="#f08a8a">
            <animate attributeName="opacity" values=".4;.4;.85;.85;.4" keyTimes="0;0.25;0.35;0.9;1" {...loop} />
            <circle cx="58" cy="62" r="4.5" />
            <circle cx="82" cy="62" r="4.5" />
          </g>

          {/* Eyes open (and smile) — while sipping they close into happy ^ ^ */}
          <g>
            <ellipse cx="62" cy="53" rx="2.4" ry="3" fill="#2b1d14" />
            <ellipse cx="78" cy="53" rx="2.4" ry="3" fill="#2b1d14" />
            <path d="M63 63 Q70 70 77 63" fill="none" stroke="#8a3b2a" strokeWidth="2" strokeLinecap="round" />
            <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;0.22;0.25;0.62;0.66;1" {...loop} />
          </g>
          <g opacity="0">
            <path d="M58.5 54 Q62 50 65.5 54 M74.5 54 Q78 50 81.5 54" fill="none" stroke="#2b1d14" strokeWidth="2" strokeLinecap="round" />
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.22;0.25;0.62;0.66;1" {...loop} />
          </g>
          {/* Big happy open smile after the sip */}
          <g opacity="0">
            <path d="M63 62 Q70 72 77 62 Z" fill="#8a3b2a" />
            <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.7;0.73;0.95;1" {...loop} />
          </g>
        </g>

        {/* "sluurp~" while sipping */}
        <text x="104" y="40" fontSize="11" fontStyle="italic" fontWeight="700" fill="#b8860b" opacity="0">
          sluurp~
          <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.3;0.34;0.52;0.56;1" {...loop} />
        </text>

        {/* Hearts float up after the sip */}
        <Heart x={100} y={30} delay={0} />
        <Heart x={112} y={42} delay={0.05} size={0.8} />
        <Heart x={92} y={18} delay={0.1} size={0.65} />

        {/* A little wooden table, with the chiyas they sent waiting on it */}
        <rect x="100" y="126" width="68" height="5" rx="2" fill="#8b5a2b" />
        <rect x="105" y="131" width="3.5" height="19" rx="1" fill="#6f4520" />
        <rect x="159.5" y="131" width="3.5" height="19" rx="1" fill="#6f4520" />
        {Array.from({ length: Math.min(cups - 1, 3) }, (_, i) => (
          <g key={i} transform={`translate(${131 + i * 14} 118.8) scale(.6)`}>
            <ChiyaGlass />
          </g>
        ))}
        {cups > 4 && (
          <g transform="translate(158 104)">
            <circle r="8" fill="#f0c34a" />
            <text textAnchor="middle" dy="3.2" fontSize="8.5" fontWeight="800" fill="#0b1f1a">+{cups - 4}</text>
          </g>
        )}

        {/* Right arm: a daura sleeve from the shoulder to the cup's handle */}
        {['#cdbfa0', '#efe6d2'].map((stroke, i) => (
          <path key={stroke} d="M92 96 Q112 106 121 114" fill="none" stroke={stroke} strokeWidth={i === 0 ? 12 : 10} strokeLinecap="round">
            <animate attributeName="d" values="M92 96 Q112 106 121 114;M92 96 Q118 90 96 68;M92 96 Q118 90 96 68;M92 96 Q112 106 121 114;M92 96 Q112 106 121 114" {...moving} />
          </path>
        ))}

        {/* The cup: lifted to the lips, tilted for a sip, set back down */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="110 114;84 64;84 64;110 114;110 114" {...moving} />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0;-28;-28;0;0" {...moving} />
            <ChiyaGlass />
          </g>
        </g>
        {/* Hand around the handle, following the cup */}
        <circle r="5.5" fill="#f2c7a0">
          <animate attributeName="cx" values="123;96;96;123;123" {...moving} />
          <animate attributeName="cy" values="114;66;66;114;114" {...moving} />
        </circle>
      </svg>
      <span key={line} className="chiya-sipper-bubble">{LINES[line]}</span>    </div>
  );
}
