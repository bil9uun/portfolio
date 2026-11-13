import { ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import gaming from "@/data/gaming.json";
import { t, useLang, useT } from "@/lib/i18n";

// Off the clock: my Counter-Strike stats from FACEIT and Steam.
// The numbers are a snapshot taken at build time (scripts/gaming.mjs).

const copy = {
  label: t("Off the clock", "Ажлын бус цагаар"),
  intro: t(
    "When I'm not coding, I play Counter-Strike 2.",
    "Код бичээгүй үедээ Counter-Strike 2 тоглодог.",
  ),
  level: t("Level", "Түвшин"),
  hours: t("hours in Counter-Strike", "цаг Counter-Strike тоглосон"),
  since: (year: number) => t(`on Steam since ${year}`, `${year} оноос Steam-д`),
  updated: (date: string) => t(`Updated ${date}`, `${date}-ны байдлаар`),
};

// Ten segments round a ring, one lit per FACEIT level.
const LevelRing = ({ level }: { level: number }) => {
  const r = 22;
  const c = 2 * Math.PI * r;
  const seg = c / 10;
  return (
    <svg
      viewBox="0 0 56 56"
      className="size-14 shrink-0 -rotate-90"
      aria-hidden
    >
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeDasharray={`${seg - 2.5} ${c - seg + 2.5}`}
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
        className="fill-bone font-display text-[20px] font-bold"
      >
        {level}
      </text>
    </svg>
  );
};

const row =
  "group flex items-center gap-4 py-4 transition-colors hover:text-signal";

const OffClock = () => {
  const tr = useT();
  const lang = useLang();
  const { faceit, steam } = gaming;
  if (!faceit && !steam) return null;
  const number = (n: number) =>
    n.toLocaleString(lang === "mn" ? "mn-MN" : "en-US");

  return (
    <div className="mt-16">
      <Build label="Label · off the clock" className="w-fit">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
          {tr(copy.label)}
        </p>
      </Build>
      <Build label="Text · games" delay={0.05} className="mt-3">
        <p className="text-fog">{tr(copy.intro)}</p>
      </Build>

      <div className="mt-4 border-t border-line">
        {faceit && (
          <Build
            label="Card · FACEIT"
            delay={0.1}
            frameClassName="inset-x-0 inset-y-1"
          >
            <a
              href={faceit.url}
              target="_blank"
              rel="noreferrer"
              data-swarm
              className={`${row} border-b border-line`}
            >
              <LevelRing level={faceit.level} />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-fog">
                  FACEIT · CS2 · {tr(copy.level)} {faceit.level}
                </span>
                <span className="mt-1 block font-display text-2xl font-semibold tracking-tight text-bone">
                  {number(faceit.elo)}{" "}
                  <span className="text-base text-fog">ELO</span>
                </span>
              </span>
              <span className="flex items-center gap-1 font-mono text-xs text-fog group-hover:text-signal">
                {faceit.nickname}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </a>
          </Build>
        )}
        {steam && (
          <Build
            label="Card · Steam"
            delay={0.15}
            frameClassName="inset-x-0 inset-y-1"
          >
            <a
              href={steam.url}
              target="_blank"
              rel="noreferrer"
              data-swarm
              className={`${row} border-b border-line`}
            >
              {steam.avatar ? (
                <img
                  src={steam.avatar}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-md border border-line object-cover"
                />
              ) : (
                <span className="size-14 shrink-0 rounded-md border border-line" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-fog">
                  Steam
                  {steam.memberSince
                    ? ` · ${tr(copy.since(steam.memberSince))}`
                    : ""}
                </span>
                {steam.cs2Hours !== null && (
                  <span className="mt-1 block font-display text-2xl font-semibold tracking-tight text-bone">
                    {number(steam.cs2Hours)}{" "}
                    <span className="text-base font-normal text-fog">
                      {tr(copy.hours)}
                    </span>
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs text-fog group-hover:text-signal">
                {steam.persona}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </a>
          </Build>
        )}
      </div>
      <p className="mt-3 font-mono text-[10px] text-fog/70">
        {tr(copy.updated(gaming.updated))}
      </p>
    </div>
  );
};

export default OffClock;
