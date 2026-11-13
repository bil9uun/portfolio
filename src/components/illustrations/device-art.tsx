import { useId } from "react";
import type { Finish } from "@/content/uses";
import { ART_BOX, type ArtKind } from "@/components/illustrations/art-kinds";

// Top-down drawings of my gear, in proportion and in each item's finish.
// Each kind draws in its own viewBox (ART_BOX), so it never stretches.

type Palette = {
  body: string;
  shade: string;
  detail: string;
  edge: string;
  key: string;
};

const PALETTES: Record<Finish | "dark", Palette> = {
  white: {
    body: "#ECEDE6",
    shade: "#CFD1C8",
    detail: "#A4A79E",
    edge: "rgba(13,15,12,0.28)",
    key: "#F7F7F2",
  },
  silver: {
    body: "#D5D8DD",
    shade: "#B7BBC1",
    detail: "#8F949A",
    edge: "rgba(13,15,12,0.3)",
    key: "#2A2C2E",
  },
  gray: {
    body: "#5E6369",
    shade: "#4D5156",
    detail: "#878C92",
    edge: "rgba(236,237,230,0.22)",
    key: "#767B81",
  },
  black: {
    body: "#1D201C",
    shade: "#2A2E29",
    detail: "#555A52",
    edge: "rgba(236,237,230,0.28)",
    key: "#2E322D",
  },
  dark: {
    body: "#23261F",
    shade: "#30342D",
    detail: "#5D6259",
    edge: "rgba(236,237,230,0.25)",
    key: "#353931",
  },
};

const GOLD = "#C9A44A";
const GLASS = "#0B0D0B";

// A seven-blade fan seen face on.
const Fan = ({
  cx,
  cy,
  r,
  p,
}: {
  cx: number;
  cy: number;
  r: number;
  p: Palette;
}) => {
  const hub = r * 0.28;
  const blade = `M0 ${-hub} C ${r * 0.25} ${-r * 0.45}, ${r * 0.62} ${-r * 0.62}, ${r * 0.18} ${-r * 0.93} C ${-r * 0.02} ${-r * 0.62}, ${-r * 0.12} ${-r * 0.4}, 0 ${-hub} Z`;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={p.shade} stroke={p.edge} />
      <circle r={r * 0.96} fill="rgba(0,0,0,0.35)" />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={blade}
          fill={p.detail}
          opacity={0.85}
          transform={`rotate(${(i * 360) / 7})`}
        />
      ))}
      <circle r={hub} fill={p.body} stroke={p.edge} />
    </g>
  );
};

// A 60% keyboard layout, row by row, in key units.
const ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
];

const Keys = ({
  x,
  y,
  width,
  height,
  fill,
  edge,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  edge: string;
}) => {
  const u = width / 15;
  const rowH = height / ROWS.length;
  const gap = u * 0.12;
  return (
    <g>
      {ROWS.flatMap((row, r) => {
        let cx = x;
        return row.map((size, k) => {
          const key = (
            <rect
              key={`${r}-${k}`}
              x={cx + gap / 2}
              y={y + r * rowH + gap / 2}
              width={size * u - gap}
              height={rowH - gap}
              rx={u * 0.14}
              fill={fill}
              stroke={edge}
              strokeWidth={0.5}
            />
          );
          cx += size * u;
          return key;
        });
      })}
    </g>
  );
};

type Props = { kind: ArtKind; color?: Finish; className?: string };

const DeviceArt = ({ kind, color, className }: Props) => {
  const id = useId().replace(/:/g, "");
  const p = PALETTES[color ?? "dark"];
  const [w, h] = ART_BOX[kind];
  const sheen = `${id}-sheen`;

  const body = (() => {
    switch (kind) {
      case "monitor":
        return (
          <>
            {/* Stand foot, neck, then the panel seen edge on */}
            <path
              d="M108 50 H172 L202 86 Q204 89 200 89 H80 Q76 89 78 86 Z"
              fill={p.shade}
              stroke={p.edge}
            />
            <rect
              x={127}
              y={10}
              width={26}
              height={44}
              rx={4}
              fill={p.body}
              stroke={p.edge}
            />
            <rect
              x={0}
              y={0}
              width={280}
              height={15}
              rx={3}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            <rect x={3} y={12} width={274} height={2.2} rx={1} fill={GLASS} />
          </>
        );
      case "keyboard":
        return (
          <>
            <rect
              width={290}
              height={100}
              rx={9}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            <Keys
              x={9}
              y={9}
              width={272}
              height={82}
              fill={p.key}
              edge={p.edge}
            />
          </>
        );
      case "mouse":
      case "magic-mouse": {
        const magic = kind === "magic-mouse";
        return (
          <>
            <path
              d={
                magic
                  ? "M30 3 C 50 3 57 14 57 40 L57 82 C 57 106 48 117 30 117 C 12 117 3 106 3 82 L3 40 C 3 14 10 3 30 3 Z"
                  : "M30 2 C 51 2 58 22 58 48 C 58 90 48 118 30 118 C 12 118 2 90 2 48 C 2 22 9 2 30 2 Z"
              }
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            {!magic && (
              <>
                <path d="M30 3 V44" stroke={p.edge} strokeWidth={1.2} />
                <path
                  d="M5 46 Q30 54 55 46"
                  fill="none"
                  stroke={p.edge}
                  strokeWidth={1.2}
                />
                <rect
                  x={26.5}
                  y={14}
                  width={7}
                  height={16}
                  rx={3.5}
                  fill={p.detail}
                  stroke={p.edge}
                />
              </>
            )}
            {magic && (
              <ellipse
                cx={30}
                cy={34}
                rx={16}
                ry={20}
                fill="rgba(255,255,255,0.25)"
              />
            )}
          </>
        );
      }
      case "mousepad":
        return (
          <>
            <rect width={w} height={h} rx={6} fill={p.body} stroke={p.edge} />
            <rect
              x={4}
              y={4}
              width={w - 8}
              height={h - 8}
              rx={4}
              fill="none"
              stroke={p.detail}
              strokeDasharray="3 3"
              strokeWidth={1.2}
            />
          </>
        );
      case "headset":
        return (
          <>
            <path
              d="M32 122 C 30 38 150 38 148 122"
              fill="none"
              stroke={p.shade}
              strokeWidth={16}
              strokeLinecap="round"
            />
            <path
              d="M32 122 C 30 38 150 38 148 122"
              fill="none"
              stroke={p.edge}
              strokeWidth={1}
            />
            {[32, 148].map((cx) => (
              <g key={cx}>
                <ellipse
                  cx={cx}
                  cy={150}
                  rx={30}
                  ry={44}
                  fill={`url(#${sheen})`}
                  stroke={p.edge}
                />
                <ellipse
                  cx={cx}
                  cy={150}
                  rx={19}
                  ry={31}
                  fill={p.detail}
                  opacity={0.7}
                />
              </g>
            ))}
          </>
        );
      case "case":
        return (
          <>
            <rect
              width={210}
              height={450}
              rx={10}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            {/* Top mesh with the 360 mm radiator's three fans below it */}
            <rect
              x={14}
              y={30}
              width={182}
              height={390}
              rx={6}
              fill={p.shade}
            />
            <rect
              x={14}
              y={30}
              width={182}
              height={390}
              rx={6}
              fill={`url(#${id}-mesh)`}
            />
            {[100, 225, 350].map((cy) => (
              <Fan key={cy} cx={105} cy={cy} r={56} p={p} />
            ))}
            {/* Front panel faces the chair */}
            <rect
              x={0}
              y={432}
              width={210}
              height={18}
              rx={6}
              fill={p.shade}
              stroke={p.edge}
            />
          </>
        );
      case "laptop":
        return (
          <>
            {/* The open lid, seen from above, then the deck */}
            <rect
              x={6}
              y={0}
              width={298}
              height={24}
              rx={6}
              fill={p.shade}
              stroke={p.edge}
            />
            <rect
              x={0}
              y={20}
              width={310}
              height={210}
              rx={12}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            <rect
              x={26}
              y={34}
              width={258}
              height={104}
              rx={5}
              fill="rgba(0,0,0,0.12)"
            />
            <Keys
              x={30}
              y={38}
              width={250}
              height={96}
              fill={p.key}
              edge="rgba(0,0,0,0.4)"
            />
            <rect
              x={98}
              y={150}
              width={114}
              height={68}
              rx={7}
              fill={p.shade}
              stroke={p.edge}
            />
          </>
        );
      case "cpu":
        return (
          <>
            <rect
              width={120}
              height={120}
              rx={5}
              fill="#2F5A36"
              stroke={p.edge}
            />
            <rect
              x={14}
              y={14}
              width={92}
              height={92}
              rx={8}
              fill={`url(#${id}-metal)`}
              stroke="rgba(0,0,0,0.3)"
            />
            {[
              [10, 30],
              [10, 82],
              [104, 30],
              [104, 82],
            ].map(([x, y]) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={6}
                height={8}
                fill="#2F5A36"
              />
            ))}
            {[44, 54, 64].map((y, i) => (
              <rect
                key={y}
                x={30}
                y={y}
                width={i === 0 ? 60 : 40}
                height={4}
                rx={2}
                fill="rgba(0,0,0,0.18)"
              />
            ))}
            <path d="M8 112 L8 104 L16 112 Z" fill={GOLD} />
          </>
        );
      case "gpu":
        return (
          <>
            <rect x={46} y={106} width={150} height={10} fill={GOLD} />
            <rect
              width={280}
              height={108}
              rx={12}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            <Fan cx={84} cy={54} r={42} p={p} />
            <Fan cx={196} cy={54} r={42} p={p} />
          </>
        );
      case "motherboard":
        return (
          <>
            <rect
              width={244}
              height={244}
              rx={6}
              fill={p.body}
              stroke={p.edge}
            />
            {/* I/O shroud and VRM heatsinks */}
            <rect
              x={6}
              y={6}
              width={30}
              height={108}
              rx={4}
              fill={p.shade}
              stroke={p.edge}
            />
            <rect
              x={44}
              y={8}
              width={90}
              height={22}
              rx={4}
              fill={p.shade}
              stroke={p.edge}
            />
            {/* Socket */}
            <rect
              x={72}
              y={42}
              width={64}
              height={64}
              rx={4}
              fill={p.detail}
              stroke={p.edge}
            />
            <rect
              x={84}
              y={54}
              width={40}
              height={40}
              rx={3}
              fill={`url(#${id}-metal)`}
            />
            {/* Memory slots */}
            {[160, 172, 184, 196].map((x) => (
              <rect
                key={x}
                x={x}
                y={10}
                width={7}
                height={118}
                rx={2}
                fill={p.shade}
                stroke={p.edge}
              />
            ))}
            {/* PCIe slots, M.2 heatsink, chipset */}
            <rect
              x={20}
              y={150}
              width={170}
              height={10}
              rx={2}
              fill={p.shade}
              stroke={p.edge}
            />
            <rect
              x={20}
              y={204}
              width={170}
              height={8}
              rx={2}
              fill={p.shade}
              stroke={p.edge}
            />
            <rect
              x={44}
              y={168}
              width={110}
              height={22}
              rx={4}
              fill={p.detail}
            />
            <rect
              x={196}
              y={170}
              width={36}
              height={36}
              rx={5}
              fill={p.shade}
              stroke={p.edge}
            />
          </>
        );
      case "ram":
        return (
          <>
            {[0, 26].map((y, i) => (
              <g key={y} transform={`translate(${i * 6} ${y})`}>
                <rect
                  x={0}
                  y={0}
                  width={130}
                  height={8}
                  rx={2}
                  fill={`url(#${id}-rgb)`}
                />
                <rect
                  x={0}
                  y={7}
                  width={130}
                  height={30}
                  rx={2}
                  fill={`url(#${sheen})`}
                  stroke={p.edge}
                />
                <rect x={6} y={37} width={118} height={4} fill={GOLD} />
              </g>
            ))}
          </>
        );
      case "cooler":
        return (
          <>
            <rect
              width={400}
              height={130}
              rx={8}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            {[70, 200, 330].map((cx) => (
              <g key={cx}>
                <rect
                  x={cx - 62}
                  y={3}
                  width={124}
                  height={124}
                  rx={12}
                  fill={p.body}
                  stroke={p.edge}
                />
                <Fan cx={cx} cy={65} r={56} p={p} />
              </g>
            ))}
          </>
        );
      case "ssd":
        return (
          <>
            <rect
              width={220}
              height={60}
              rx={4}
              fill="#1A1C19"
              stroke={p.edge}
            />
            <rect x={0} y={6} width={16} height={48} fill={GOLD} />
            <rect x={8} y={26} width={8} height={8} fill="#1A1C19" />
            <rect x={36} y={12} width={64} height={36} rx={2} fill="#0F110E" />
            <rect x={112} y={12} width={50} height={36} rx={2} fill="#0F110E" />
            <rect x={36} y={18} width={130} height={24} rx={2} fill="#2C302A" />
            <circle
              cx={210}
              cy={30}
              r={6}
              fill="none"
              stroke={GOLD}
              strokeWidth={2}
            />
          </>
        );
      case "psu":
        return (
          <>
            <rect
              width={150}
              height={140}
              rx={8}
              fill={`url(#${sheen})`}
              stroke={p.edge}
            />
            <circle cx={75} cy={70} r={56} fill={p.shade} stroke={p.edge} />
            {[16, 30, 44].map((r) => (
              <circle
                key={r}
                cx={75}
                cy={70}
                r={r}
                fill="none"
                stroke={p.detail}
                strokeWidth={2}
              />
            ))}
            <path
              d="M75 14 V126 M19 70 H131"
              stroke={p.detail}
              strokeWidth={2}
            />
            <circle cx={75} cy={70} r={8} fill={p.body} />
          </>
        );
    }
  })();

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={kind === "mousepad" ? "none" : "xMidYMid meet"}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.body} />
          <stop offset="1" stopColor={p.shade} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E7E9EC" />
          <stop offset="0.5" stopColor="#BFC3C8" />
          <stop offset="1" stopColor="#9EA3A9" />
        </linearGradient>
        <linearGradient id={`${id}-rgb`} x1="0" x2="1">
          <stop offset="0" stopColor="#FF5CA8" />
          <stop offset="0.33" stopColor="#A57BFF" />
          <stop offset="0.66" stopColor="#2EC4D6" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <pattern
          id={`${id}-mesh`}
          width={6}
          height={6}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={3} cy={3} r={1.2} fill="rgba(0,0,0,0.25)" />
        </pattern>
      </defs>
      {body}
    </svg>
  );
};

export default DeviceArt;
