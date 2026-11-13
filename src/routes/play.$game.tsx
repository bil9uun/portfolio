import { Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Build from "@/components/ui/build";
import Footer from "@/components/layout/footer";
import { findGame } from "@/games/registry";
import { t, useT } from "@/lib/i18n";
import { unlock } from "@/lib/achievements";
import { usePageReady } from "@/lib/navigation";
import { pageContainer } from "@/components/ui/styles";
import BackLink from "@/components/ui/back-link";

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
    <div className={pageContainer}>
      <BackLink to="/play">{tr(copy.back)}</BackLink>

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
