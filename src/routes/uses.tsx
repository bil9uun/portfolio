import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import Footer from "@/components/footer";
import { finishes, useGroups, type UseItem } from "@/data/uses";
import { t, useT } from "@/lib/i18n";
import { usePageReady } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
  unknown: t("Finish not listed", "Өнгө тодорхойгүй"),
  items: (n: number) => t(`${n} items`, `${n} зүйл`),
};

// The colour strip covers the hardware only.
const all = useGroups.filter((g) => g.hardware).flatMap((g) => g.items);
const whites = all.filter((item) => item.color === "white").length;

// One square per item, in its finish: the whole setup at a glance.
const FinishStrip = () => {
  const tr = useT();
  return (
    <div>
      <ul className="flex flex-wrap gap-1.5" aria-hidden>
        {all.map((item) => (
          <li
            key={item.name}
            title={item.name}
            className={cn(
              "size-5 border",
              item.color ? "border-line" : "border-dashed border-fog/50",
            )}
            style={
              item.color ? { background: finishes[item.color].hex } : undefined
            }
          />
        ))}
      </ul>
      <p className="mt-3 font-mono text-xs text-fog">
        {tr(copy.white(whites, all.length))}
      </p>
    </div>
  );
};

const Row = ({ item }: { item: UseItem }) => {
  const tr = useT();
  const name = (
    <span className="font-display text-xl font-semibold leading-snug tracking-tight md:text-2xl">
      {item.name}
    </span>
  );
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-t border-line py-5 md:grid-cols-[11rem_1fr_auto]">
      <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fog md:col-span-1">
        {tr(item.kind)}
      </span>
      <span className="min-w-0">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            data-swarm
            className="group inline-flex items-baseline gap-1.5 transition-colors hover:text-signal"
          >
            {name}
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-fog transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
            />
          </a>
        ) : (
          name
        )}
        {item.detail && (
          <span className="mt-1 block font-mono text-xs text-fog">
            {tr(item.detail)}
          </span>
        )}
      </span>
      <span
        className="flex items-center gap-2 self-center font-mono text-[11px] text-fog"
        title={item.color ? undefined : tr(copy.unknown)}
      >
        {item.color && (
          <>
            <span
              aria-hidden
              className="size-3 rounded-full border border-line"
              style={{ background: finishes[item.color].hex }}
            />
            <span className="hidden sm:inline">
              {tr(finishes[item.color].label)}
            </span>
          </>
        )}
      </span>
    </div>
  );
};

function UsesPage() {
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

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Build label="Heading · uses" immediate delay={0.3} className="w-fit">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
              <span className="text-signal">//</span> {tr(copy.eyebrow)}
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.03em]">
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
        </div>
        <Build
          label="Strip · finishes"
          immediate
          delay={0.5}
          className="lg:col-span-4"
        >
          <FinishStrip />
        </Build>
      </div>

      <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
        {useGroups.map((group) => (
          <section key={group.id} aria-labelledby={`uses-${group.id}`}>
            <Build label={`Group · ${group.title.en}`} className="w-fit">
              <h2
                id={`uses-${group.id}`}
                className="font-display text-4xl font-semibold tracking-tight md:text-5xl"
              >
                {tr(group.title)}
              </h2>
              <p className="mt-2 font-mono text-xs text-fog">
                {tr(copy.items(group.items.length))}
                {group.note && ` · ${tr(group.note)}`}
              </p>
            </Build>
            <ul className="mt-8 border-b border-line">
              {group.items.map((item, i) => (
                <li key={item.name}>
                  <Build label={`Item · ${item.name}`} delay={(i % 4) * 0.05}>
                    <Row item={item} />
                  </Build>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Footer />
    </div>
  );
}
