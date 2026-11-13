import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import Build from "@/components/build";
import WaveText from "@/components/wave-text";
import { finishes, useGroups, type UseItem } from "@/data/uses";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { t, useT } from "@/lib/i18n";
import { click } from "@/lib/sound";
import { cn } from "@/lib/utils";

// The desks, seen from above like a design canvas: each device is a layer
// you can select, with a layers list and an inspector beside it, as in Figma.
// The full list lives on /uses.

const copy = {
  eyebrow: t("Setup", "Setup"),
  title: t("My desks", "Миний ширээ"),
  intro: t(
    "One desk for code, one for Counter-Strike. Pick anything on the canvas.",
    "Нэг ширээ код бичихэд, нөгөө нь Counter-Strike-д. Canvas дээрх дурын зүйлийг сонгоорой.",
  ),
  work: t("Work desk", "Ажлын ширээ"),
  gaming: t("Gaming desk", "Тоглоомын ширээ"),
  layers: t("Layers", "Layers"),
  inspect: t("Inspect", "Inspect"),
  finish: t("Finish", "Өнгө"),
  parts: t("Inside", "Дотор нь"),
  software: t("Software", "Программ хангамж"),
  all: t("See the full setup", "Бүгдийг харах"),
};

// x, y, width, height in % of the desk; rotation in degrees.
type Placement = {
  name: string;
  box: [number, number, number, number];
  rotate?: number;
  round?: boolean;
};

const DESKS = {
  work: {
    group: "work",
    items: [
      { name: "Acer 32″", box: [24, 8, 48, 6] },
      { name: "MacBook Pro 14″", box: [6, 40, 24, 34], rotate: 6 },
      { name: "NuPhy Air60 V2", box: [37, 56, 25, 15] },
      { name: "Apple Magic Mouse 2", box: [69, 58, 4.5, 12], round: true },
    ],
  },
  gaming: {
    group: "desk",
    items: [
      { name: "ASUS TUF Gaming VG259QM", box: [6, 16, 25, 5], rotate: -16 },
      { name: "ASUS ROG Strix XG259QNSR-W", box: [33, 8, 28, 5] },
      { name: "ATK Sky XSoft", box: [30, 46, 46, 38] },
      { name: "ATK RS6+", box: [34, 56, 22, 14], rotate: -6 },
      { name: "ATK Dragonfly Y9", box: [63, 58, 4, 11], round: true },
      { name: "ATK Neptune N9 V2", box: [79, 14, 7, 20], round: true },
      { name: "Phanteks Eclipse G360A", box: [86, 46, 11, 40] },
    ],
  },
} satisfies Record<string, { group: string; items: Placement[] }>;

type DeskId = keyof typeof DESKS;

const byName = new Map(
  useGroups.flatMap((g) => g.items).map((item) => [item.name, item]),
);
const pcParts = useGroups.find((g) => g.id === "pc")!.items;
const CASE = "Phanteks Eclipse G360A";

const fill = (item: UseItem) => {
  switch (item.color) {
    case "white":
      return { background: "#ECEDE6", color: "#0D0F0C" };
    case "silver":
      return { background: "#C9CCD1", color: "#0D0F0C" };
    case "gray":
      return { background: "#6E737A", color: "#ECEDE6" };
    case "black":
      return {
        background: "#1A1C19",
        color: "#ECEDE6",
        // Dark gear on a dark canvas: a lighter edge keeps it visible.
        borderColor: "rgba(236, 237, 230, 0.28)",
      };
    default:
      return { background: "#272B25", color: "#ECEDE6" };
  }
};

const SetupSection = () => {
  const tr = useT();
  const [desk, setDesk] = useState<DeskId>("gaming");
  const [selected, setSelected] = useState(
    DESKS.gaming.items[1].name, // the main monitor
  );
  const canvas = useRef<HTMLDivElement>(null);
  const placed = DESKS[desk].items;
  const item = byName.get(selected)!;

  // Place the devices on the desk one by one when it first comes in.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.set("[data-device]", { autoAlpha: 0, scale: 0.7 });
      let done = false;
      const trigger = ScrollTrigger.create({
        trigger: canvas.current,
        start: "top 75%",
        onEnter: () => {
          if (done) return;
          done = true;
          requestAnimationFrame(() => trigger.kill());
          gsap.to("[data-device]", {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.6)",
            stagger: 0.09,
            delay: 0.5,
          });
        },
      });
    },
    { scope: canvas },
  );

  const pick = (name: string) => {
    setSelected(name);
    click({ pitch: 1.2, gain: 0.03 });
  };

  const switchDesk = (next: DeskId) => {
    if (next === desk) return;
    setDesk(next);
    setSelected(
      next === "gaming" ? DESKS.gaming.items[1].name : DESKS.work.items[0].name,
    );
    click({ pitch: 0.9, gain: 0.03 });
    // Drop the new desk's devices in.
    requestAnimationFrame(() => {
      if (prefersReducedMotion() || !canvas.current) return;
      gsap.fromTo(
        canvas.current.querySelectorAll("[data-device]"),
        { autoAlpha: 0, scale: 0.7 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.6)",
          stagger: 0.06,
        },
      );
    });
  };

  const software = useGroups
    .find((g) => g.id === "software")!
    .items.filter((s) => s.kind.en !== "Extensions")
    .slice(0, 8);

  return (
    <section id="setup" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Build label="Heading · setup" className="w-fit">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
            <span className="text-signal">//</span> {tr(copy.eyebrow)}
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.015em]">
            <WaveText text={tr(copy.title)} />
          </h2>
        </Build>
        <Build label="Text · intro" className="mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-fog">{tr(copy.intro)}</p>
        </Build>

        <Build label="Frame · desks" className="mt-16 md:mt-24">
          {/* Desk tabs */}
          <div
            role="tablist"
            aria-label={tr(copy.title)}
            className="mb-4 inline-flex rounded-full border border-line p-1 font-mono text-xs"
          >
            {(["gaming", "work"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={desk === id}
                onClick={() => switchDesk(id)}
                className={cn(
                  "rounded-full px-4 py-1.5 transition-colors",
                  desk === id ? "bg-bone text-ink" : "text-fog hover:text-bone",
                )}
              >
                {tr(copy[id])}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {/* Canvas: the desk from above */}
            <div
              ref={canvas}
              className="relative overflow-hidden rounded-sm border border-line bg-ink/60 lg:col-span-8"
            >
              <div aria-hidden className="canvas-grid absolute inset-0" />
              <div className="relative m-6 aspect-[2/1] md:m-10">
                {/* The desktop itself */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-md border border-dashed border-fog/30"
                />
                {placed.map((p) => {
                  const device = byName.get(p.name)!;
                  const [x, y, w, h] = p.box;
                  const active = selected === p.name;
                  return (
                    <button
                      key={`${desk}-${p.name}`}
                      type="button"
                      data-device
                      data-swarm
                      onClick={() => pick(p.name)}
                      aria-pressed={active}
                      aria-label={`${tr(device.kind)}: ${device.name}`}
                      className="group absolute"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                        rotate: p.rotate ? `${p.rotate}deg` : undefined,
                      }}
                    >
                      <span
                        className={cn(
                          "absolute inset-0 border border-ink/40 shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-[filter] group-hover:brightness-125",
                          p.round ? "rounded-full" : "rounded-[3px]",
                        )}
                        style={fill(device)}
                      />
                      {/* Selection: outline, handles and a name tag */}
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute -inset-1.5 border border-signal transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {[
                          "-left-1 -top-1",
                          "-right-1 -top-1",
                          "-bottom-1 -left-1",
                          "-bottom-1 -right-1",
                        ].map((pos) => (
                          <span
                            key={pos}
                            className={cn(
                              "absolute size-2 border border-signal bg-ink",
                              pos,
                            )}
                          />
                        ))}
                      </span>
                      <span
                        className={cn(
                          "pointer-events-none absolute bottom-full left-0 mb-2.5 whitespace-nowrap rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] font-medium text-ink transition-opacity",
                          active
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                        )}
                        style={{
                          rotate: p.rotate ? `${-p.rotate}deg` : undefined,
                        }}
                      >
                        {tr(device.kind)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layers + inspector */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <div className="rounded-sm border border-line bg-ink/60">
                <p className="border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                  {tr(copy.layers)}
                </p>
                <ul className="py-1 font-mono text-xs">
                  {placed.map((p) => {
                    const device = byName.get(p.name)!;
                    const active = selected === p.name;
                    return (
                      <li key={p.name}>
                        <button
                          type="button"
                          onClick={() => pick(p.name)}
                          aria-pressed={active}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                            active
                              ? "bg-signal/15 text-bone"
                              : "text-fog hover:bg-graphite hover:text-bone",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "size-3 shrink-0 border border-line",
                              p.round ? "rounded-full" : "rounded-[2px]",
                            )}
                            style={{ background: fill(device).background }}
                          />
                          <span className="w-28 shrink-0 truncate text-[10px] uppercase tracking-[0.12em]">
                            {tr(device.kind)}
                          </span>
                          <span className="truncate">{device.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                aria-live="polite"
                className="flex-1 rounded-sm border border-line bg-ink/60 p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                  {tr(copy.inspect)} · {tr(item.kind)}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
                  {item.name}
                </p>
                {item.detail && (
                  <p className="mt-1 font-mono text-xs text-fog">
                    {tr(item.detail)}
                  </p>
                )}
                {item.color && (
                  <p className="mt-4 flex items-center gap-2 font-mono text-xs text-fog">
                    {tr(copy.finish)}
                    <span
                      aria-hidden
                      className="size-3 rounded-full border border-line"
                      style={{ background: finishes[item.color].hex }}
                    />
                    <span className="text-bone">
                      {tr(finishes[item.color].label)}
                    </span>
                  </p>
                )}
                {item.name === CASE && (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                      {tr(copy.parts)}
                    </p>
                    <ul className="mt-2 space-y-1 font-mono text-[11px]">
                      {pcParts
                        .filter((part) => part.name !== CASE)
                        .map((part) => (
                          <li key={part.name} className="flex gap-3">
                            <span className="w-20 shrink-0 text-fog">
                              {tr(part.kind)}
                            </span>
                            <span className="text-bone">{part.name}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Build>

        {/* Software, briefly */}
        <Build label="List · software" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                {tr(copy.software)}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-4">
                {software.map((s) => (
                  <li key={s.name}>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-fog">
                      {tr(s.kind)}
                    </span>
                    <span className="text-sm text-bone">
                      {s.name.split(" · ")[0]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/uses"
              data-swarm
              className="group inline-flex items-center gap-2 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
            >
              {tr(copy.all)}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Build>
      </div>
    </section>
  );
};

export default SetupSection;
