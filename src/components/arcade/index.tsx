import { lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import OffClock from "@/components/off-clock";
import SectionHeading from "@/components/section-heading";
import { games } from "@/components/games/registry";
import { readBest } from "@/components/games/use-best";
import { t, useT } from "@/lib/i18n";

// The herding game is small enough to play right here; it loads on its own.
const Herd = lazy(() => import("@/components/games/herd"));

const copy = {
  intro: t(
    "I build games in my spare time with the same parts as this site. Try one right here: push the cursors into the frame.",
    "Чөлөөт цагаараа энэ сайтын эд ангиар тоглоом хийдэг. Энд шууд туршаад үзээрэй: cursor-уудыг frame дотор хөөж оруул.",
  ),
  tryIt: t("Try it here", "Энд туршаад үз"),
  more: t("All games", "Бүх тоглоом"),
  best: t("Best", "Шилдэг"),
  all: t("Open the arcade", "Бүх тоглоомыг үзэх"),
  loading: t("Loading…", "Ачаалж байна…"),
};

const ArcadeSection = () => {
  const tr = useT();

  return (
    <section id="play" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="play" />
        <Build label="Text · intro" className="mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-fog">{tr(copy.intro)}</p>
        </Build>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-10">
          <Build
            label="Frame · playground"
            className="lg:col-span-7"
            frameClassName="-inset-2"
          >
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
              {tr(copy.tryIt)}
            </p>
            <Suspense
              fallback={
                <div className="grid h-[360px] place-items-center rounded-sm border border-line font-mono text-xs text-fog">
                  {tr(copy.loading)}
                </div>
              }
            >
              <Herd compact />
            </Suspense>
          </Build>

          <div className="lg:col-span-5">
            <Build label="Label · games" className="w-fit">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                {tr(copy.more)}
              </p>
            </Build>
            <ul className="mt-3 border-t border-line">
              {games.map((game, i) => {
                const best = readBest(game.id);
                return (
                  <li key={game.id}>
                    <Build
                      label={`Row · ${game.title.en}`}
                      delay={i * 0.05}
                      frameClassName="inset-x-0 inset-y-1"
                    >
                      <Link
                        to="/play/$game"
                        params={{ game: game.id }}
                        data-swarm
                        className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-line py-4"
                      >
                        <span
                          aria-hidden
                          className="size-2.5 rounded-full transition-transform duration-500 group-hover:scale-150"
                          style={{ background: game.color }}
                        />
                        <span className="min-w-0">
                          <span className="block font-display text-xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1">
                            {tr(game.title)}
                          </span>
                          <span className="mt-1 block truncate text-sm text-fog">
                            {tr(game.blurb)}
                          </span>
                        </span>
                        <span className="flex items-center gap-3 font-mono text-[11px] text-fog">
                          {best !== null && (
                            <span className="hidden sm:inline">
                              {tr(copy.best)}{" "}
                              <span style={{ color: game.color }}>
                                {tr(game.best(best))}
                              </span>
                            </span>
                          )}
                          <ArrowUpRight
                            aria-hidden
                            className="size-4 transition-all duration-500 group-hover:rotate-45 group-hover:text-signal"
                          />
                        </span>
                      </Link>
                    </Build>
                  </li>
                );
              })}
            </ul>
            <Build label="Link · arcade" className="mt-8 w-fit">
              <Link
                to="/play"
                className="group inline-flex items-center gap-2 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
              >
                {tr(copy.all)}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Build>
            <OffClock />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcadeSection;
