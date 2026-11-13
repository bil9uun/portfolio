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

export const Scoreboard = ({ matches }: { matches: Match[] }) => {
  const tr = useT();
  const lang = useLang();
  const cols =
    "grid grid-cols-[3px_1fr_3.25rem_4.75rem_2.75rem] items-center gap-x-3 sm:grid-cols-[3px_1fr_3.5rem_5rem_3rem_3rem_3rem_3.5rem]";
  return (
    <div className="font-mono text-xs">
      <div
        className={cn(
          cols,
          "pb-2 text-[10px] uppercase tracking-[0.16em] text-fog",
        )}
      >
        <span />
        <span>{tr(copy.map)}</span>
        <span>{tr(copy.score)}</span>
        <span>{tr(copy.kda)}</span>
        <span className="hidden sm:block">HS</span>
        <span className="hidden sm:block">ADR</span>
        <span className="text-right">ELO</span>
        <span className="hidden text-right sm:block">{tr(copy.date)}</span>
      </div>
      <ul>
        {matches.map((m, i) => (
          <li
            key={i}
            data-row
            className={cn(
              cols,
              "border-t border-line py-2.5 text-fog transition-colors hover:bg-graphite",
            )}
          >
            <span
              aria-label={tr(m.win ? copy.win : copy.loss)}
              className="h-5 w-[3px]"
              style={{ background: m.win ? WIN : LOSS }}
            />
            <span className="truncate text-bone">{mapName(m.map)}</span>
            <span style={{ color: m.win ? WIN : LOSS }}>
              {m.score[0]}:{m.score[1]}
            </span>
            <span>
              {m.kills}/{m.deaths}/{m.assists}
            </span>
            <span className="hidden sm:block">{m.headshots}%</span>
            <span className="hidden sm:block">{Math.round(m.adr ?? 0)}</span>
            <span
              className="text-right"
              style={{ color: m.delta >= 0 ? WIN : LOSS }}
            >
              {m.delta >= 0 ? "+" : "−"}
              {Math.abs(m.delta)}
            </span>
            <span className="hidden text-right sm:block">
              {shortDate(m.date, lang)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Per map, from the matches we have: how often, how well.
export const MapPool = ({ matches }: { matches: Match[] }) => {
  const tr = useT();
  const maps = Object.values(
    matches.reduce<
      Record<
        string,
        { map: string; n: number; wins: number; k: number; d: number }
      >
    >((acc, m) => {
      const e = (acc[m.map] ??= { map: m.map, n: 0, wins: 0, k: 0, d: 0 });
      e.n++;
      e.wins += m.win ? 1 : 0;
      e.k += m.kills;
      e.d += m.deaths;
      return acc;
    }, {}),
  ).sort((a, b) => b.n - a.n);
  const most = maps[0]?.n ?? 1;

  return (
    <ul className="space-y-4">
      {maps.map((e) => {
        const rate = Math.round((e.wins / e.n) * 100);
        return (
          <li key={e.map}>
            <p className="flex items-baseline justify-between gap-3 font-mono text-xs">
              <span className="text-bone">{mapName(e.map)}</span>
              <span className="text-fog">
                {tr(copy.played(e.n))} · {rate}% · K/D{" "}
                {(e.k / Math.max(1, e.d)).toFixed(2)}
              </span>
            </p>
            {/* Bar length: how often; green part: how many won. */}
            <div
              aria-hidden
              className="mt-2 flex h-1.5 bg-line"
              style={{ width: `${(e.n / most) * 100}%` }}
            >
              <div
                data-meter
                className="h-full origin-left"
                style={{ width: `${rate}%`, background: WIN }}
              />
              <div
                data-meter
                className="h-full origin-left"
                style={{
                  width: `${100 - rate}%`,
                  background: LOSS,
                  opacity: 0.6,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
