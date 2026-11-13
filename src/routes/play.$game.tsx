import { Suspense, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import Build from "@/components/build";
import Footer from "@/components/footer";
import { findGame } from "@/components/games/registry";
import { t, useT } from "@/lib/i18n";
import { unlock } from "@/lib/achievements";
import { usePageReady } from "@/lib/navigation";

export const Route = createFileRoute("/play/$game")({ component: GamePage });

const copy = {
  back: t("All games", "Бүх тоглоом"),
  eyebrow: t("Play", "Тоглох"),
  missing: t("This game doesn't exist.", "Ийм тоглоом алга."),
  loading: t("Loading…", "Ачаалж байна…"),
};

function GamePage() {
  const { game: id } = Route.useParams();
  const tr = useT();
  usePageReady();
  const game = findGame(id);
  useEffect(() => {
    if (game) unlock("player");
  }, [game]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-36 md:px-10 md:pt-44">
      <Build label="Link · back" immediate delay={0.2} className="w-fit">
        <Link
          to="/play"
          className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-bone"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {tr(copy.back)}
        </Link>
      </Build>

      {!game ? (
        <p className="mt-10 font-display text-4xl font-semibold">
          {tr(copy.missing)}
        </p>
      ) : (
        <div key={game.id}>
          <Build
            label={`Heading · ${game.id}`}
            immediate
            delay={0.3}
            className="mt-10 w-fit"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
              <span style={{ color: game.color }}>//</span> {tr(copy.eyebrow)}
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.03em]">
              {tr(game.title)}
            </h1>
          </Build>

          <Build
            label="Text · intro"
            immediate
            delay={0.4}
            className="mt-8 max-w-xl"
          >
            <p className="text-lg leading-relaxed text-fog">{tr(game.blurb)}</p>
          </Build>

          <div className="mt-16 md:mt-20">
            <Suspense
              fallback={
                <p className="font-mono text-xs text-fog">{tr(copy.loading)}</p>
              }
            >
              <game.Component />
            </Suspense>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
