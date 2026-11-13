import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import Build from "@/components/ui/build";
import Footer from "@/components/layout/footer";
import { games } from "@/games/registry";
import { readBest } from "@/games/use-best";
import { t, useT } from "@/lib/i18n";
import { usePageReady } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { pageContainer } from "@/components/ui/styles";
import BackLink from "@/components/ui/back-link";
import Heading from "@/components/ui/heading";

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
    <div className={pageContainer}>
      <BackLink to="/">{tr(copy.back)}</BackLink>

      <div className="mt-10">
        <Heading
          level={1}
          label="Heading · play"
          immediate
          delay={0.3}
          eyebrow={
            <>
              <span className="text-signal">//</span> {tr(copy.eyebrow)}
            </>
          }
          title={tr(copy.title)}
          intro={tr(copy.intro)}
        />
      </div>

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
