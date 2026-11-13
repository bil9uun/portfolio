import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import SectionHeading from "@/components/section-heading";
import gaming from "@/data/gaming.json";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { t, useLang, useT, type Lang } from "@/lib/i18n";
import { createStore, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Off the clock: my Counter-Strike on FACEIT and my Steam profile, laid out
// like a game HUD. A snapshot taken at build time by scripts/gaming.mjs.

type Faceit = NonNullable<typeof gaming.faceit>;
type Match = Faceit["matches"][number];

const WIN = "#22C55E";
const LOSS = "#FF5C5C";

// FACEIT CS2 levels: the ELO each one starts at.
const LEVELS = [100, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001];

const copy = {
  intro: t(
    "When I'm not coding, I play Counter-Strike 2, mostly on FACEIT. Here's how it's going.",
    "Код бичээгүй үедээ Counter-Strike 2 тоглодог, ихэвчлэн FACEIT дээр. Одоогийн байдал:",
  ),
  updated: (date: string) => t(`Snapshot · ${date}`, `${date}-ны байдлаар`),
  level: t("Level", "Түвшин"),
  toNext: (elo: number, level: number) =>
    t(`${elo} ELO to level ${level}`, `${level}-р түвшин хүртэл ${elo} ELO`),
  maxLevel: t("Top level", "Дээд түвшин"),
  rank: (region: string) => t(`${region} rank`, `${region} бүсэд`),
  since: (year: number) => t(`since ${year}`, `${year} оноос`),
  eloTrend: (n: number) =>
    t(`ELO · last ${n} matches`, `ELO · сүүлийн ${n} тоглолт`),
  matches: t("Matches", "Тоглолт"),
  winRate: t("Win rate", "Ялалт"),
  kd: t("K/D", "K/D"),
  hs: t("Headshot", "Headshot"),
  adr: t("ADR", "ADR"),
  streak: t("Best streak", "Дараалсан ялалт"),
  scoreboard: t("Recent matches", "Сүүлийн тоглолтууд"),
  map: t("Map", "Map"),
  score: t("Score", "Оноо"),
  kda: t("K / D / A", "K / D / A"),
  date: t("Date", "Огноо"),
  maps: (n: number) => t(`Maps · last ${n}`, `Map · сүүлийн ${n}`),
  played: (n: number) => t(`${n} played`, `${n} тоглолт`),
  win: t("W", "Я"),
  loss: t("L", "Х"),
  steamLevel: t("Level", "Түвшин"),
  vac: t("No VAC bans", "VAC ban байхгүй"),
  cs2Hours: t("Hours in CS2", "CS2 цаг"),
  twoWeeks: t("Past 2 weeks", "Сүүлийн 2 долоо хоног"),
  badges: t("Badges", "Badge"),
  games: t("Games", "Тоглоом"),
  friends: t("Friends", "Найз"),
  recentlyPlayed: t("Recently played", "Сүүлд тоглосон"),
  hours: t("h", "ц"),
  last: (date: string) => t(`last ${date}`, `сүүлд ${date}`),
};

const locale = (lang: Lang) => (lang === "mn" ? "mn-MN" : "en-US");
const shortDate = (iso: string, lang: Lang) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return lang === "mn"
    ? `${d.getUTCMonth() + 1}.${String(d.getUTCDate()).padStart(2, "0")}`
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const mapName = (m: string) => m.charAt(0).toUpperCase() + m.slice(1);

// Set once the HUD scrolls into view; every Count then runs up to its value.
const hudOnline = createStore(false);

// A number that counts up when the HUD comes online.
const Count = ({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) => {
  const lang = useLang();
  const online = useStore(hudOnline);
  const [shown, setShown] = useState(() =>
    hudOnline.get() || prefersReducedMotion() ? value : 0,
  );
  useEffect(() => {
    if (!online) return;
    const v = { n: 0 };
    const tween = gsap.to(v, {
      n: value,
      duration: 1.4,
      ease: "power3.out",
      onUpdate: () => setShown(v.n),
    });
    return () => void tween.kill();
  }, [online, value]);
  return (
    <span className="tabular-nums">
      {shown.toLocaleString(locale(lang), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// HUD panel: hairline border with bright corner brackets.
const Panel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "relative border border-line bg-ink/70 p-5 backdrop-blur-sm md:p-6",
      className,
    )}
  >
    {[
      "left-0 top-0 border-l-2 border-t-2",
      "right-0 top-0 border-r-2 border-t-2",
      "bottom-0 left-0 border-b-2 border-l-2",
      "bottom-0 right-0 border-b-2 border-r-2",
    ].map((pos) => (
      <span
        key={pos}
        aria-hidden
        className={cn("absolute -m-px size-3 border-[#FF7A45]", pos)}
      />
    ))}
    {children}
  </div>
);

const Label = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
    {children}
  </p>
);

// Ten segments round a ring, one lit per FACEIT level.
const LevelRing = ({ level }: { level: number }) => {
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

// ELO after each match, oldest to newest, with a tooltip on hover.
const EloChart = ({ matches }: { matches: Match[] }) => {
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

// A stat readout, optionally with a meter for percentages.
const Readout = ({
  label,
  children,
  meter,
}: {
  label: string;
  children: ReactNode;
  meter?: number;
}) => (
  <div className="border-l border-line pl-4">
    <Label>{label}</Label>
    <p className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
      {children}
    </p>
    {meter !== undefined && (
      <div aria-hidden className="mt-3 h-1 bg-line">
        <div
          data-meter
          className="h-full origin-left bg-signal"
          style={{ width: `${meter}%` }}
        />
      </div>
    )}
  </div>
);

const Scoreboard = ({ matches }: { matches: Match[] }) => {
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
const MapPool = ({ matches }: { matches: Match[] }) => {
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

const AfkSection = () => {
  const tr = useT();
  const lang = useLang();
  const hud = useRef<HTMLDivElement>(null);
  const f = gaming.faceit;
  const s = gaming.steam;

  // Bring the HUD online once: numbers count up, the chart draws left to
  // right, meters fill and the scoreboard rows tick in.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !hud.current) return;
      const reveal = hud.current.querySelector("[data-reveal]");
      const setup = () => {
        gsap.set("[data-meter]", { scaleX: 0 });
        gsap.set("[data-dot], [data-row]", { autoAlpha: 0 });
        gsap.set('[data-ring="on"]', { autoAlpha: 0.15 });
        if (reveal) gsap.set(reveal, { attr: { width: 0 } });
      };
      setup();
      let played = false;
      const trigger = ScrollTrigger.create({
        trigger: hud.current,
        start: "top 70%",
        onEnter: () => {
          if (played) return;
          played = true;
          requestAnimationFrame(() => trigger.kill());
          const tl = gsap.timeline({ delay: 0.5 });
          tl.to('[data-ring="on"]', {
            autoAlpha: 1,
            duration: 0.25,
            stagger: 0.07,
          });
          tl.call(() => hudOnline.set(true), undefined, 0);
          if (reveal)
            tl.to(
              reveal,
              { attr: { width: 820 }, duration: 1.6, ease: "power2.inOut" },
              0.1,
            );
          tl.to(
            "[data-dot]",
            { autoAlpha: 1, duration: 0.2, stagger: 0.04 },
            0.15,
          )
            .to(
              "[data-meter]",
              { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.03 },
              0.3,
            )
            .to(
              "[data-row]",
              { autoAlpha: 1, duration: 0.25, stagger: 0.05 },
              0.5,
            );
        },
      });
    },
    { scope: hud },
  );

  if (!f && !s) return null;
  const n = (v: number) => v.toLocaleString(locale(lang));
  const chrono = f ? [...f.matches].reverse() : [];
  const nextAt = f ? LEVELS[f.level] : undefined;
  const levelStart = f ? LEVELS[f.level - 1] : 0;
  const progress =
    f && nextAt ? ((f.elo - levelStart) / (nextAt - levelStart)) * 100 : 100;
  const last = f?.matches[0];
  const l = f?.lifetime;

  return (
    <section id="afk" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="afk" />
        <Build label="Text · intro" className="mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-fog">{tr(copy.intro)}</p>
        </Build>

        <Build
          label="Frame · HUD"
          className="mt-16 md:mt-24"
        >
          <div ref={hud} className="relative">
            {/* Faint scanlines over the whole HUD */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(236,237,230,0.025)_0px,rgba(236,237,230,0.025)_1px,transparent_1px,transparent_4px)]"
            />

            {f && (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                  <span>
                    <span className="text-[#FF7A45]">●</span> FACEIT · CS2 ·{" "}
                    {f.region}
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
                              {last.delta >= 0 ? "▲" : "▼"}{" "}
                              {Math.abs(last.delta)}
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
                          <dt className="text-fog">
                            {tr(copy.rank(f.region))}
                          </dt>
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
            )}

            {s && (
              <>
                <div className="mb-3 mt-10 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                  <span>
                    <span className="text-[#4D8DFF]">●</span> Steam
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    data-swarm
                    className="inline-flex items-center gap-1 normal-case tracking-normal text-bone transition-colors hover:text-signal"
                  >
                    {s.persona}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                </div>
                <Panel>
                  <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="flex items-center gap-4 lg:col-span-3">
                      {s.avatar && (
                        <img
                          src={s.avatar}
                          alt=""
                          width={64}
                          height={64}
                          loading="lazy"
                          className="size-16 shrink-0 border border-line object-cover"
                        />
                      )}
                      <div>
                        <p className="flex items-center gap-2">
                          {s.level !== null && (
                            <span className="grid size-9 place-items-center rounded-full border-2 border-[#4D8DFF] font-display text-sm font-bold">
                              {s.level}
                            </span>
                          )}
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                            {tr(copy.steamLevel)}
                          </span>
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-fog">
                          {s.memberSince && tr(copy.since(s.memberSince))}
                          {!s.vacBanned && (
                            <>
                              <br />
                              {tr(copy.vac)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-5 lg:col-span-9">
                      {s.cs2Hours !== null && (
                        <Readout label={tr(copy.cs2Hours)}>
                          <Count value={s.cs2Hours} />
                        </Readout>
                      )}
                      {s.recentHours !== null && (
                        <Readout label={tr(copy.twoWeeks)}>
                          <Count value={s.recentHours} decimals={1} />
                          <span className="text-base text-fog">
                            {" "}
                            {tr(copy.hours)}
                          </span>
                        </Readout>
                      )}
                      {s.badges !== null && (
                        <Readout label={tr(copy.badges)}>
                          <Count value={s.badges} />
                        </Readout>
                      )}
                      {s.games !== null && (
                        <Readout label={tr(copy.games)}>
                          <Count value={s.games} />
                        </Readout>
                      )}
                      {s.friends !== null && (
                        <Readout label={tr(copy.friends)}>
                          <Count value={s.friends} />
                        </Readout>
                      )}
                    </div>
                  </div>

                  {s.recent.length > 0 && (
                    <div className="mt-8 border-t border-line pt-5">
                      <Label>{tr(copy.recentlyPlayed)}</Label>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {s.recent.map((g) => (
                          <li key={g.name}>
                            <a
                              href={g.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center border border-line transition-colors hover:border-[#4D8DFF] sm:block"
                            >
                              <img
                                src={g.image}
                                alt=""
                                width={184}
                                height={69}
                                loading="lazy"
                                className="aspect-[184/69] w-28 shrink-0 object-cover opacity-80 transition-opacity group-hover:opacity-100 sm:w-full"
                              />
                              <span className="block min-w-0 px-3 py-2.5">
                                <span className="block truncate text-sm text-bone">
                                  {g.name}
                                </span>
                                <span className="mt-0.5 block font-mono text-[11px] text-fog">
                                  {n(g.hours)} {tr(copy.hours)}
                                  {g.lastPlayed &&
                                    ` · ${tr(copy.last(shortDate(g.lastPlayed, lang)))}`}
                                </span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </>
            )}
          </div>
        </Build>
      </div>
    </section>
  );
};

export default AfkSection;
