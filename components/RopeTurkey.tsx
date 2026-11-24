/**
 * The Long Table's mark: Rope's pine-cone turkey, redrawn.
 * A bark-and-marigold tail fan edged with seed pods, a pine-cone body,
 * a crushed-petal plum neck, a painted blue head and a red wattle.
 *
 * Pure SVG with no ids or hooks, so it works on the server, in the browser,
 * and inside ImageResponse (the app icons), which can't draw React fragments. `simple` drops the fine detail
 * for tiny sizes like the favicon.
 */

const C = {
  panel: "#5a3a32",
  bark: "#3d4046",
  pod: "#efe5cf",
  podLine: "#c4b28a",
  marigold: "#e0a032",
  dryPlum: "#8a4a62",
  feather: "#b3ada5",
  featherLine: "#857e76",
  coneGap: "#3a2826",
  cone: "#8c6150",
  coneTip: "#46322c",
  coneEdge: "#c99c78",
  neck: "#6b2152",
  neckFleck: "#93407c",
  head: "#0a84c6",
  headShine: "#5fb8ea",
  beak: "#ecdcb4",
  wattle: "#c8192e",
  wattleDeep: "#8e0f22",
  leg: "#c9a878",
};

// Tiny deterministic random numbers, so the speckles land in the same place every render.
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// The tail fan's top edge is a curve from (6,20) through control (50,2) to (94,20).
function fanTop(x: number) {
  const t = (x - 6) / 88;
  return 20 - 36 * t * (1 - t);
}

const FAN = "M17 58 L6 20 Q50 2 94 20 L83 58 Z";

function speckles() {
  const r = rand(7);
  const dots: { x: number; y: number; c: string; rx: number; a: number }[] = [];
  while (dots.length < 90) {
    const x = 10 + r() * 80;
    const y = 8 + r() * 48;
    if (y < fanTop(x) + 4 || y > 54) continue;
    const half = 40 - (y - 20) * 0.26; // the fan narrows toward the bottom
    if (Math.abs(x - 50) > half - 3) continue;
    dots.push({ x, y, c: r() < 0.55 ? C.marigold : C.dryPlum, rx: 0.9 + r() * 1.3, a: r() * 180 });
  }
  return dots;
}

function scales(simple: boolean) {
  const out: { x: number; y: number; s: number }[] = [];
  const cx = 50, cy = 70, R = 21;
  const step = simple ? 7 : 5.2;
  for (let row = 0, y = cy - R + 3; y < cy + R; row++, y += step * 0.8) {
    for (let x = cx - R + (row % 2 ? step / 2 : 0); x < cx + R; x += step) {
      if (Math.hypot(x - cx, y - cy) < R - 2.4) out.push({ x, y, s: step / 5.2 });
    }
  }
  return out;
}

const SPECKLES = speckles();
const SCALES = scales(false);
const SCALES_SIMPLE = scales(true);

export function RopeTurkey({
  className,
  simple = false,
  title,
  size,
}: {
  className?: string;
  simple?: boolean;
  title?: string;
  /** Pixel size, for ImageResponse; on the page, size it with `className`. */
  size?: number;
}) {
  const scaleList = simple ? SCALES_SIMPLE : SCALES;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}

      {/* Tail fan: bark-framed panels of dried flowers */}
      <path d={FAN} fill={C.panel} stroke={C.bark} strokeWidth="3" strokeLinejoin="round" />
      {!simple &&
        SPECKLES.map((d, i) => (
          <ellipse
            key={i}
            cx={d.x}
            cy={d.y}
            rx={d.rx}
            ry={d.rx * 0.6}
            fill={d.c}
            transform={`rotate(${d.a} ${d.x} ${d.y})`}
          />
        ))}
      {/* bark strips between the panels */}
      <g stroke={C.bark} strokeWidth={simple ? 3 : 2.4} strokeLinecap="round">
        <path d="M35 57 L29.5 17" />
        <path d="M50 57 V13" />
        <path d="M65 57 L70.5 17" />
      </g>
      {/* seed pods along the top edge and across the middle */}
      <path
        d="M7 20 Q50 2 93 20"
        fill="none"
        stroke={C.podLine}
        strokeWidth={simple ? 6.5 : 5.6}
        strokeLinecap="round"
      />
      <path
        d="M7 20 Q50 2 93 20"
        fill="none"
        stroke={C.pod}
        strokeWidth={simple ? 4.8 : 4}
        strokeLinecap="round"
        strokeDasharray={simple ? undefined : "4.2 1.1"}
      />
      {!simple && (
        <g>
          <path d="M12 39 Q50 25 88 39" fill="none" stroke={C.podLine} strokeWidth="4.4" strokeLinecap="round" />
          <path d="M12 39 Q50 25 88 39" fill="none" stroke={C.pod} strokeWidth="3" strokeLinecap="round" strokeDasharray="3.6 1" />
        </g>
      )}

      {/* Feathers tucked in at the sides */}
      <g fill={C.feather} stroke={C.featherLine} strokeWidth="0.8">
        <path d="M33 64 Q16 58 6 62 Q18 68 33 68 Z" />
        <path d="M32 72 Q15 72 7 78 Q20 80 32 76 Z" />
        <path d="M67 64 Q84 58 94 62 Q82 68 67 68 Z" />
        <path d="M68 72 Q85 72 93 78 Q80 80 68 76 Z" />
        {!simple && <path d="M66 80 Q80 84 86 91 Q74 90 65 84 Z" />}
      </g>

      {/* Stick legs with pine-needle toes */}
      <g stroke={C.leg} strokeLinecap="round">
        <path d="M44 88 L42 97" strokeWidth="2.6" />
        <path d="M56 88 L58 97" strokeWidth="2.6" />
        {!simple && (
          <g strokeWidth="0.8">
            <path d="M42 97 L37 99 M42 97 L42 100 M42 97 L46 99" />
            <path d="M58 97 L54 99 M58 97 L58 100 M58 97 L63 99" />
          </g>
        )}
      </g>

      {/* Pine-cone body */}
      <circle cx="50" cy="70" r="21" fill={C.coneGap} />
      {scaleList.map(({ x, y, s }, i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 -3.4 Q3.4 -1.4 2.8 1.8 Q0 3.8 -2.8 1.8 Q-3.4 -1.4 0 -3.4 Z" fill={C.cone} stroke={C.coneEdge} strokeWidth="0.45" />
          {!simple && <ellipse cx="0" cy="-1.4" rx="1.5" ry="1.1" fill={C.coneTip} />}
        </g>
      ))}

      {/* Plum neck */}
      <path d="M43 54 Q42 40 45.5 30 L54 30 Q58 40 57 54 Q50 57 43 54 Z" fill={C.neck} />
      {!simple && (
        <g fill={C.neckFleck}>
          {[
            [46, 34], [52, 36], [48, 40], [54, 43], [45, 46], [51, 48], [55, 50], [47, 51], [50, 43], [53, 32],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.9" />
          ))}
        </g>
      )}

      {/* Wattle, head and beak */}
      <path d="M40 31 Q37 37 40 41 Q43 38 43 33 Z" fill={C.wattleDeep} />
      <path d="M42 30 Q40 37 43.5 40 Q46 35 45 30 Z" fill={C.wattle} />
      <ellipse cx="49" cy="25" rx="10.5" ry="7.8" fill={C.head} transform="rotate(-8 49 25)" />
      {!simple && <ellipse cx="51" cy="21.5" rx="4.5" ry="2" fill={C.headShine} opacity="0.55" transform="rotate(-10 51 21.5)" />}
      <path d="M40 26 L28 30 L40.5 30.5 Z" fill={C.beak} stroke="#b89c6c" strokeWidth="0.5" strokeLinejoin="round" />
      <circle cx="45" cy="23.5" r="1.5" fill="#15100e" />
    </svg>
  );
}
