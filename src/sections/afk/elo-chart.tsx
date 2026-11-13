import { useState } from "react";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  copy,
  LOSS,
  WIN,
  shortDate,
  mapName,
  type Match,
} from "@/sections/afk/data";

// ELO after each match, oldest to newest, with a tooltip on hover.
export const EloChart = ({ matches }: { matches: Match[] }) => {
  const tr = useT();
  const lang = useLang();
  const [active, setActive] = useState<number | null>(null);
  const W = 800;
  const H = 220;
  const elos = matches.map((m) => m.elo);
  const lo = Math.floor((Math.min(...elos) - 10) / 50) * 50;
  const hi = Math.ceil((Math.max(...elos) + 10) / 50) * 50;
  const x = (i: number) => (i / Math.max(1, matches.length - 1)) * W;
  const y = (elo: number) => (1 - (elo - lo) / (hi - lo)) * H;
  const line = matches
    .map((m, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(m.elo).toFixed(1)}`)
    .join(" ");
  const ticks = Array.from(
    { length: (hi - lo) / 50 + 1 },
    (_, i) => lo + i * 50,
  );
  const m = active === null ? null : matches[active];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setActive(Math.round(f * (matches.length - 1)));
  };

  return (
    <div
      className="relative ml-10 h-56 md:h-64"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      {/* Grid and axis labels */}
      {ticks.map((tick) => (
        <div
          key={tick}
          aria-hidden
          className="absolute inset-x-0 border-t border-dashed border-line/70"
          style={{ top: `${(y(tick) / H) * 100}%` }}
        >
          <span className="absolute -left-10 -translate-y-1/2 font-mono text-[10px] text-fog">
            {tick}
          </span>
        </div>
      ))}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="afk-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={WIN} stopOpacity="0.28" />
            <stop offset="1" stopColor={WIN} stopOpacity="0" />
          </linearGradient>
          <clipPath id="afk-reveal">
            <rect data-reveal x="-10" y="-10" width={W + 20} height={H + 20} />
          </clipPath>
        </defs>
        <g clipPath="url(#afk-reveal)">
          <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#afk-fill)" />
          <path
            d={line}
            fill="none"
            stroke={WIN}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        {m && (
          <line
            x1={x(active!)}
            x2={x(active!)}
            y1={0}
            y2={H}
            stroke="#8b9187"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* Dots in HTML so they stay round while the chart stretches. */}
      {matches.map((match, i) => (
        <span
          key={i}
          data-dot
          aria-hidden
          className={cn(
            "pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink transition-transform duration-200",
            active === i && "scale-[1.8]",
          )}
          style={{
            left: `${(x(i) / W) * 100}%`,
            top: `${(y(match.elo) / H) * 100}%`,
            background: match.win ? WIN : LOSS,
          }}
        />
      ))}
      {/* Tooltip */}
      {m && (
        <div
          className="pointer-events-none absolute z-10 w-48 border border-line bg-ink/95 px-3 py-2 font-mono text-[11px] text-fog shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{
            left: `${Math.min(Math.max((x(active!) / W) * 100, 12), 88)}%`,
            top: `${(y(m.elo) / H) * 100}%`,
            transform: `translate(-50%, calc(-100% - 14px))`,
          }}
        >
          <p className="flex justify-between text-bone">
            <span>{mapName(m.map)}</span>
            <span style={{ color: m.win ? WIN : LOSS }}>
              {m.score[0]}:{m.score[1]}
            </span>
          </p>
          <p className="mt-1 flex justify-between">
            <span>
              {m.kills}/{m.deaths}/{m.assists}
            </span>
            <span>ADR {Math.round(m.adr ?? 0)}</span>
          </p>
          <p className="mt-1 flex justify-between">
            <span>{shortDate(m.date, lang)}</span>
            <span className="text-bone">
              {m.elo}{" "}
              <span style={{ color: m.delta >= 0 ? WIN : LOSS }}>
                ({m.delta >= 0 ? "+" : "−"}
                {Math.abs(m.delta)})
              </span>
            </span>
          </p>
        </div>
      )}
      <p className="sr-only">
        {tr(copy.eloTrend(matches.length))}: {matches[0].elo} →{" "}
        {matches[matches.length - 1].elo}
      </p>
    </div>
  );
};
