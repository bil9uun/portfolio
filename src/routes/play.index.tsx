import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import Footer from "@/components/footer";
import { games } from "@/components/games/registry";
import { readBest } from "@/components/games/use-best";
import { t, useT } from "@/lib/i18n";
import { usePageReady } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/")({ component: PlayHub });

const copy = {
  back: t("Back home", "Нүүр хуудас руу буцах"),
  eyebrow: t("Play", "Тоглох"),
  title: t("Arcade", "Тоглоомын булан"),
  intro: t(
    "Small games built from the same parts as this site: cursors, frames and the stack I work with.",
    "Энэ сайтын cursor, frame, миний ашигладаг stack-аар бүтээсэн жижиг тоглоомууд.",
  ),
  best: t("Best", "Шилдэг"),
  notPlayed: t("Not played yet", "Тоглоогүй байна"),
};

function PlayHub() {
  const tr = useT();
  usePageReady();
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-36 md:px-10 md:pt-44">
      <Build label="Link · back" immediate delay={0.2} className="w-fit">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-bone"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {tr(copy.back)}
        </Link>
      </Build>

      <Build
        label="Heading · play"
        immediate
        delay={0.3}
        className="mt-10 w-fit"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
          <span className="text-signal">//</span> {tr(copy.eyebrow)}
        </p>
        <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.03em]">
          {tr(copy.title)}
        </h1>
      </Build>

      <Build
        label="Text · intro"
        immediate
        delay={0.4}
        className="mt-8 max-w-xl"
      >
        <p className="text-lg leading-relaxed text-fog">{tr(copy.intro)}</p>
      </Build>

      <ul className="mt-16 grid gap-px border border-line bg-line md:mt-24 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, i) => {
          const best = readBest(game.id);
          return (
            <li
              key={game.id}
              className={cn(
                "bg-ink",
                // 8 cards: a wide first card fills the 3-column grid; a wide last
                // card evens out the 2-column one.
                i === 0 && "md:col-span-2",
                i === games.length - 1 && "md:col-span-2 lg:col-span-1",
              )}
            >
              <Build
                label={`Game · ${game.title.en}`}
                delay={(i % 3) * 0.1}
                className="h-full"
              >
                <Link
                  to="/play/$game"
                  params={{ game: game.id }}
                  data-swarm
                  className="group flex h-full flex-col p-8 transition-colors duration-500 hover:bg-graphite md:p-10"
                >
                  <span
                    aria-hidden
                    className="h-1 w-10 rounded-full transition-[width] duration-500 group-hover:w-20"
                    style={{ background: game.color }}
                  />
                  <span className="mt-8 flex items-start justify-between gap-4 font-display text-3xl font-semibold leading-tight tracking-tight">
                    {tr(game.title)}
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-6 shrink-0 text-fog transition-all duration-500 group-hover:rotate-45 group-hover:text-signal"
                    />
                  </span>
                  <span className="mt-4 flex-1 leading-relaxed text-fog">
                    {tr(game.blurb)}
                  </span>
                  <span className="mt-8 font-mono text-xs text-fog">
                    {best === null ? (
                      tr(copy.notPlayed)
                    ) : (
                      <>
                        {tr(copy.best)}{" "}
                        <span style={{ color: game.color }}>
                          {tr(game.best(best))}
                        </span>
                      </>
                    )}
                  </span>
                </Link>
              </Build>
            </li>
          );
        })}
      </ul>

      <Footer />
    </div>
  );
}
