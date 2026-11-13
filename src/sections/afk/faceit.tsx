import { ArrowUpRight } from "lucide-react";
import gaming from "@/content/gaming.json";
import { useT } from "@/lib/i18n";
import { copy, LOSS, WIN, LEVELS } from "@/sections/afk/data";
import { Count, Panel, Label, Readout } from "@/sections/afk/hud";
import { EloChart } from "@/sections/afk/elo-chart";
import { MapPool, Scoreboard } from "@/sections/afk/matches";

// Ten segments round a ring, one lit per FACEIT level.
export const LevelRing = ({ level }: { level: number }) => {
  const r = 22;
  const c = 2 * Math.PI * r;
  const seg = c / 10;
  return (
    <svg
      viewBox="0 0 56 56"
      className="size-24 shrink-0 -rotate-90"
      aria-hidden
    >
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          data-ring={i < level ? "on" : "off"}
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="3.5"
          strokeDasharray={`${seg - 2.2} ${c - seg + 2.2}`}
          strokeDashoffset={-i * seg}
          className={i < level ? "stroke-signal" : "stroke-line"}
        />
      ))}
      <text
        x="28"
        y="28"
        transform="rotate(90 28 28)"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-bone font-display text-[22px] font-bold"
      >
        {level}
      </text>
    </svg>
  );
};

// FACEIT: player card, ELO chart, lifetime readouts, scoreboard and maps.
export const FaceitHud = ({ f }: { f: NonNullable<typeof gaming.faceit> }) => {
  const tr = useT();
  const chrono = [...f.matches].reverse();
  const nextAt = LEVELS[f.level];
  const levelStart = LEVELS[f.level - 1];
  const progress = nextAt
    ? ((f.elo - levelStart) / (nextAt - levelStart)) * 100
    : 100;
  const last = f.matches[0];
  const l = f.lifetime;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
        <span>
          <span className="text-[#FF7A45]">●</span> FACEIT · CS2 · {f.region}
        </span>
        <span>{tr(copy.updated(gaming.updated))}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {/* Player */}
        <Panel className="lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <Label>
              {tr(copy.level)} {f.level}
            </Label>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              data-swarm
              className="inline-flex items-center gap-1 font-mono text-xs text-bone transition-colors hover:text-signal"
            >
              {f.nickname}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <LevelRing level={f.level} />
            <div>
              <p className="font-display text-6xl font-semibold leading-none tracking-tight">
                <Count value={f.elo} />
              </p>
              <p className="mt-2 font-mono text-xs text-fog">
                ELO
                {last && (
                  <span
                    className="ml-2"
                    style={{ color: last.delta >= 0 ? WIN : LOSS }}
                  >
                    {last.delta >= 0 ? "▲" : "▼"} {Math.abs(last.delta)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div aria-hidden className="h-1.5 bg-line">
              <div
                data-meter
                className="h-full origin-left bg-signal"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-fog">
              {nextAt
                ? tr(copy.toNext(nextAt - f.elo, f.level + 1))
                : tr(copy.maxLevel)}
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4 font-mono text-xs">
            {f.regionRank !== null && (
              <div>
                <dt className="text-fog">{tr(copy.rank(f.region))}</dt>
                <dd className="mt-1 text-lg text-bone">
                  #<Count value={f.regionRank} />
                </dd>
              </div>
            )}
            <div>
              <dt className="text-fog">FACEIT</dt>
              <dd className="mt-1 text-lg text-bone">
                {tr(copy.since(f.memberSince))}
              </dd>
            </div>
          </dl>
        </Panel>

        {/* ELO chart */}
        {chrono.length > 1 && (
          <Panel className="lg:col-span-8">
            <Label>{tr(copy.eloTrend(chrono.length))}</Label>
            <div className="mt-6">
              <EloChart matches={chrono} />
            </div>
          </Panel>
        )}

        {/* Lifetime readouts */}
        {l && (
          <Panel className="lg:col-span-12">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              <Readout label={tr(copy.matches)}>
                <Count value={l.matches} />
              </Readout>
              <Readout label={tr(copy.winRate)} meter={l.winRate}>
                <Count value={l.winRate} suffix="%" />
              </Readout>
              <Readout label={tr(copy.kd)}>
                <Count value={l.kd} decimals={2} />
              </Readout>
              <Readout label={tr(copy.hs)} meter={l.headshots}>
                <Count value={l.headshots} suffix="%" />
              </Readout>
              <Readout label={tr(copy.adr)}>
                <Count value={Math.round(l.adr)} />
              </Readout>
              <Readout label={tr(copy.streak)}>
                <Count value={l.longestStreak} />
              </Readout>
            </div>
          </Panel>
        )}

        {/* Scoreboard + map pool */}
        {f.matches.length > 0 && (
          <>
            <Panel className="lg:col-span-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Label>{tr(copy.scoreboard)}</Label>
                <span className="flex gap-1">
                  {f.matches
                    .slice(0, 5)
                    .reverse()
                    .map((m, i) => (
                      <span
                        key={i}
                        className="grid size-5 place-items-center font-mono text-[10px] font-semibold text-ink"
                        style={{ background: m.win ? WIN : LOSS }}
                      >
                        {tr(m.win ? copy.win : copy.loss)}
                      </span>
                    ))}
                </span>
              </div>
              <Scoreboard matches={f.matches.slice(0, 10)} />
            </Panel>
            <Panel className="lg:col-span-5">
              <Label>{tr(copy.maps(f.matches.length))}</Label>
              <div className="mt-5">
                <MapPool matches={f.matches} />
              </div>
            </Panel>
          </>
        )}
      </div>
    </>
  );
};
