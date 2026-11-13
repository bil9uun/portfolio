import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ModelView, ShowcaseCanvas } from "@/components/desk-3d/showcase";
import DeviceArt from "@/components/illustrations/device-art";
import Build from "@/components/ui/build";
import Footer from "@/components/layout/footer";
import { finishes, useGroups, type UseItem } from "@/content/uses";
import { t, useT } from "@/lib/i18n";
import { scrollToSection } from "@/lib/gsap";
import { usePageReady } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { pageContainer } from "@/components/ui/styles";
import BackLink from "@/components/ui/back-link";
import Heading from "@/components/ui/heading";

export const Route = createFileRoute("/uses")({ component: UsesPage });

const copy = {
  back: t("Back home", "Нүүр хуудас руу буцах"),
  eyebrow: t("Uses", "Uses"),
  title: t("What's on my desks", "Миний ширээн дээр"),
  intro: t(
    "The hardware and software I work and play with. One desk for code, one for Counter-Strike, and a strong preference for white.",
    "Ажиллаж, тоглодог тоног төхөөрөмж, программууд маань. Нэг ширээ код бичихэд, нөгөө нь Counter-Strike-д. Цагаан өнгөнд дуртай.",
  ),
  white: (n: number, total: number) =>
    t(`${n} of ${total} white`, `${total}-аас ${n} нь цагаан`),
  items: (n: number) => t(`${n} items`, `${n} зүйл`),
  jump: t("Jump to a group", "Бүлэг рүү очих"),
};

// The colour strip covers the hardware only.
const all = useGroups.filter((g) => g.hardware).flatMap((g) => g.items);
const whites = all.filter((item) => item.color === "white").length;

// Every piece of hardware in miniature: the whole setup at a glance.
const Lineup = () => {
  const tr = useT();
  return (
    <div>
      <ul className="grid grid-cols-6 gap-2" aria-hidden>
        {all.map((item) => (
          <li
            key={item.name}
            title={item.name}
            className="grid aspect-square place-items-center rounded-sm border border-line bg-ink/60 p-1.5"
          >
            <DeviceArt
              kind={item.art!}
              color={item.color}
              className="size-full"
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-xs text-fog">
        {tr(copy.white(whites, all.length))}
      </p>
    </div>
  );
};

// Hardware: the item turning in 3D on a small canvas, then what it is.
const Card = ({ item }: { item: UseItem }) => {
  const tr = useT();
  const finish = item.color && finishes[item.color];
  const Wrapper = item.url ? "a" : "div";
  return (
    <Wrapper
      {...(item.url && { href: item.url, target: "_blank", rel: "noreferrer" })}
      data-swarm
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-ink/60 transition-colors duration-500 hover:border-signal/60"
    >
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden border-b border-line">
        <div aria-hidden className="canvas-grid absolute inset-0" />
        <ModelView name={item.name} className="absolute inset-0" />
        <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.16em] text-fog">
          {tr(item.kind)}
        </span>
        {finish && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 font-mono text-[10px] text-fog">
            <span
              aria-hidden
              className="size-2.5 rounded-full border border-line"
              style={{ background: finish.hex }}
            />
            {tr(finish.label)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-start justify-between gap-3 font-display text-lg font-semibold leading-snug tracking-tight">
          {item.name}
          {item.url && (
            <ArrowUpRight
              aria-hidden
              className="mt-1 size-4 shrink-0 text-fog transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
            />
          )}
        </p>
        {item.detail && (
          <p className="mt-1.5 font-mono text-xs text-fog">{tr(item.detail)}</p>
        )}
      </div>
    </Wrapper>
  );
};

// The last tile stretches over the empty cells of its row (2 and 3 columns).
const lastTileSpan = (n: number) =>
  cn(
    n % 2 === 1 && "sm:col-span-2",
    n % 3 === 1 && "lg:col-span-3",
    n % 3 === 2 && "lg:col-span-2",
    n % 3 === 0 && "lg:col-span-1",
  );

// Software and the site's stack: no drawing, just the facts.
const Tile = ({ item }: { item: UseItem }) => {
  const tr = useT();
  return (
    <div className="h-full bg-ink p-5 transition-colors duration-500 hover:bg-graphite">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fog">
        {tr(item.kind)}
      </p>
      <p className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">
        {item.name}
      </p>
      {item.detail && (
        <p className="mt-1.5 font-mono text-xs text-fog">{tr(item.detail)}</p>
      )}
    </div>
  );
};

function UsesPage() {
  const tr = useT();
  usePageReady();

  return (
    <div className={pageContainer}>
      <BackLink to="/">{tr(copy.back)}</BackLink>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Heading
            level={1}
            label="Heading · uses"
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
        <Build
          label="Strip · finishes"
          immediate
          delay={0.5}
          className="lg:col-span-4"
        >
          <Lineup />
        </Build>
      </div>

      <Build label="Nav · groups" immediate delay={0.6} className="mt-12 w-fit">
        <nav aria-label={tr(copy.jump)}>
          <ul className="flex flex-wrap gap-2 font-mono text-xs">
            {useGroups.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(`uses-${group.id}`)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-fog transition-colors hover:border-signal hover:text-bone"
                >
                  {tr(group.title)}
                  <span className="ml-2 text-fog/60">{group.items.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </Build>

      <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
        {useGroups.map((group) => (
          <section
            key={group.id}
            id={`uses-${group.id}`}
            aria-labelledby={`uses-${group.id}-title`}
          >
            <Build label={`Group · ${group.title.en}`} className="w-fit">
              <h2
                id={`uses-${group.id}-title`}
                className="font-display text-4xl font-semibold tracking-tight md:text-5xl"
              >
                {tr(group.title)}
              </h2>
              <p className="mt-2 font-mono text-xs text-fog">
                {tr(copy.items(group.items.length))}
                {group.note && ` · ${tr(group.note)}`}
              </p>
            </Build>
            {group.hardware ? (
              <ul
                className={cn(
                  "mt-8 grid gap-4 sm:grid-cols-2",
                  group.items.length % 4 === 0
                    ? "lg:grid-cols-4"
                    : "lg:grid-cols-3",
                )}
              >
                {group.items.map((item, i) => (
                  <li key={item.name}>
                    <Build
                      label={`Item · ${item.name}`}
                      delay={(i % 4) * 0.06}
                      className="h-full"
                    >
                      <Card item={item} />
                    </Build>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, i) => (
                  <li
                    key={item.name}
                    className={cn(
                      "bg-ink",
                      i === group.items.length - 1 &&
                        lastTileSpan(group.items.length),
                    )}
                  >
                    <Tile item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* One WebGL canvas behind every card's 3D model */}
      <ShowcaseCanvas />
      <Footer />
    </div>
  );
}
