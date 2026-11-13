import { ArrowUpRight } from "lucide-react";
import gaming from "@/content/gaming.json";
import { useLang, useT } from "@/lib/i18n";
import { copy, locale, shortDate } from "@/sections/afk/data";
import { Count, Panel, Label, Readout } from "@/sections/afk/hud";

// Steam: profile, hours and recently played games.
export const SteamPanel = ({ s }: { s: NonNullable<typeof gaming.steam> }) => {
  const tr = useT();
  const lang = useLang();
  const n = (v: number) => v.toLocaleString(locale(lang));

  return (
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
                <span className="text-base text-fog"> {tr(copy.hours)}</span>
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
  );
};
