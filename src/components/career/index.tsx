import { useEffect, useRef, useState } from "react";
import Build from "@/components/build";
import SectionHeading from "@/components/section-heading";
import { education, experience } from "@/data/portfolio";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { t, ui, useLang, useT, type Text } from "@/lib/i18n";
import { click } from "@/lib/sound";
import { cn } from "@/lib/utils";

// Study and work on one track, like a video editor's timeline: a playhead
// runs from 2007 to today as the section comes in, and dragging it (or
// picking a bar) shows that part of the story below.

type Lane = "study" | "work";
type Entry = {
  id: string;
  lane: Lane;
  start: number;
  end: number | null; // null = still going
  period: Text;
  title: Text;
  subtitle: Text;
  body?: Text;
  tags?: string[];
  level?: Text;
  gpa?: number;
};

const same = (s: string) => t(s, s);

const ENTRIES: Entry[] = [
  ...education.map(
    (e): Entry => ({
      id: e.school.en,
      lane: "study",
      start: e.span[0],
      end: e.span[1],
      period: same(e.period),
      title: e.school,
      subtitle: e.credential,
      body: e.note,
      level: e.level,
      gpa: e.gpa,
    }),
  ),
  ...experience.map(
    (e): Entry => ({
      id: e.org,
      lane: "work",
      start: e.span[0],
      end: e.span[1],
      period: e.period,
      title: same(e.org.replace(/ LLC$/, "")),
      subtitle: e.role,
      body: e.summary,
      tags: e.tags,
    }),
  ),
].sort((a, b) => a.start - b.start);

const now = new Date();
const NOW = now.getFullYear() + now.getMonth() / 12;
const FIRST = Math.floor(Math.min(...ENTRIES.map((e) => e.start)));
const pct = (year: number) => ((year - FIRST) / (NOW - FIRST)) * 100;
const endOf = (e: Entry) => e.end ?? NOW;
const YEARS = Array.from(
  { length: Math.floor(NOW) - FIRST + 1 },
  (_, i) => FIRST + i,
);

const copy = {
  intro: t(
    "After six years of medical education, I moved into software engineering through an intensive full-stack program and have worked as a frontend developer since. Drag the playhead or select a period to see the details.",
    "Анагаах ухаанд 6 жил суралцсаны дараа full stack сургалтын хөтөлбөрөөр дамжуулан програм хангамжийн салбарт шилжиж, түүнээс хойш фронтенд хөгжүүлэгчээр ажиллаж байна. Дэлгэрэнгүйг харахын тулд playhead-ийг чирэх эсвэл хугацааг сонгоно уу.",
  ),
  lanes: {
    study: t("Education", "Боловсрол"),
    work: t("Work", "Ажлын туршлага"),
  },
  now: t("Now", "Одоо"),
  years: t("years", "жил"),
  months: t("months", "сар"),
};

// Work: how long, from the data. "2+" while it's still going.
const duration = (e: Entry) => {
  const years = endOf(e) - e.start;
  if (years < 1)
    return { value: String(Math.round(years * 12)), unit: copy.months };
  return {
    value: e.end === null ? `${Math.floor(years)}+` : String(Math.round(years)),
    unit: copy.years,
  };
};

// The entry under a point in time; work wins where the lanes overlap.
const entryAt = (year: number) =>
  ENTRIES.filter((e) => year >= e.start && year <= endOf(e)).sort((a, b) =>
    a.lane === b.lane ? 0 : a.lane === "work" ? -1 : 1,
  )[0];

const GPA_SCALE = 4;
const GPA_TICKS = 40;

// GPA on a ruler: one tick per 0.1, taller ticks at each whole point.
const GpaMeter = ({ gpa }: { gpa: number }) => {
  const tr = useT();
  const filled = Math.round((gpa / GPA_SCALE) * GPA_TICKS);
  return (
    <div
      role="meter"
      aria-label={tr(ui.gpa)}
      aria-valuemin={0}
      aria-valuemax={GPA_SCALE}
      aria-valuenow={gpa}
      className="w-full md:ml-auto md:max-w-64"
    >
      <p className="flex items-baseline gap-2 md:justify-end">
        <span className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
          {gpa.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-fog">
          / {GPA_SCALE.toFixed(1)} {tr(ui.gpa)}
        </span>
      </p>
      <div aria-hidden className="mt-4 flex h-6 items-end justify-between">
        {Array.from({ length: GPA_TICKS }, (_, i) => (
          <span
            key={i}
            data-tick
            className={cn(
              "w-px origin-bottom",
              (i + 1) % 10 === 0 ? "h-6" : "h-3.5",
              i < filled ? "bg-signal" : "bg-line",
            )}
          />
        ))}
      </div>
    </div>
  );
};

const CareerSection = () => {
  const tr = useT();
  const [selected, setSelected] = useState(
    () => ENTRIES.find((e) => e.end === null) ?? ENTRIES[ENTRIES.length - 1],
  );
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const headLabel = useRef<HTMLSpanElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const bars = useRef<Map<string, HTMLElement>>(new Map());
  const time = useRef({ year: NOW }); // where the playhead is
  const lastYear = useRef(Math.floor(NOW));
  const lang = useLang();

  // Move the playhead and reveal each bar up to it.
  const render = () => {
    const year = time.current.year;
    head.current!.style.left = `${pct(year)}%`;
    headLabel.current!.textContent =
      year >= NOW - 0.05 ? tr(copy.now) : String(Math.floor(year));
    bars.current.forEach((bar, id) => {
      const e = ENTRIES.find((x) => x.id === id)!;
      const f = Math.max(
        0,
        Math.min(1, (year - e.start) / (endOf(e) - e.start)),
      );
      bar.style.clipPath = `inset(0 ${((1 - f) * 100).toFixed(2)}% 0 0)`;
    });
    // A soft tick each time the playhead crosses into a new year.
    const whole = Math.floor(year);
    if (whole !== lastYear.current) {
      lastYear.current = whole;
      click({ pitch: 0.8, gain: 0.015 });
    }
  };

  // Play from the first year to today when the track scrolls into view.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return render();
      time.current.year = FIRST;
      render();
      let played = false;
      const trigger = ScrollTrigger.create({
        trigger: track.current,
        start: "top 75%",
        onEnter: () => {
          if (played) return;
          played = true;
          requestAnimationFrame(() => trigger.kill());
          gsap.to(time.current, {
            year: NOW,
            duration: 2.6,
            delay: 0.6,
            ease: "power2.inOut",
            onUpdate: render,
          });
        },
      });
    },
    { scope: track },
  );

  // The playhead's "Now" label is written directly; refresh it on a language switch.
  useEffect(() => {
    if (headLabel.current?.textContent) render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Fade the details in when the selection changes.
  useEffect(() => {
    if (prefersReducedMotion() || !details.current) return;
    gsap.fromTo(
      details.current.children,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.05 },
    );
  }, [selected]);

  const yearAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return FIRST + f * (NOW - FIRST);
  };

  const seek = (year: number, entry = entryAt(year)) => {
    gsap.killTweensOf(time.current);
    time.current.year = year;
    render();
    if (entry && entry.id !== selected.id) setSelected(entry);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const bar = (e.target as Element).closest<HTMLElement>("[data-entry]");
    const picked = bar && ENTRIES.find((x) => x.id === bar.dataset.entry);
    seek(yearAt(e.clientX), picked ?? undefined);
    track.current!.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (track.current!.hasPointerCapture(e.pointerId)) seek(yearAt(e.clientX));
  };

  // Arrow keys step through the entries in time order.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = ENTRIES.indexOf(selected) + (e.key === "ArrowRight" ? 1 : -1);
    const next = ENTRIES[(i + ENTRIES.length) % ENTRIES.length];
    seek(next.start + 0.01, next);
    bars.current.get(next.id)?.parentElement?.focus();
  };

  const stat = selected.gpa === undefined ? duration(selected) : null;

  return (
    <section id="experience" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="experience" />
        <Build label="Text · intro" className="mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-fog">{tr(copy.intro)}</p>
        </Build>

        <Build label="Frame · timeline" className="mt-16 md:mt-24">
          <div>
            <div
              ref={track}
              role="group"
              aria-label={tr(copy.intro)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onKeyDown={onKeyDown}
              className="relative cursor-ew-resize touch-pan-y select-none pt-10"
            >
              {/* Year ruler */}
              <div aria-hidden className="relative h-6 border-b border-line">
                {YEARS.map((year) => (
                  <span
                    key={year}
                    className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${pct(year)}%` }}
                  >
                    {(year - FIRST) % 3 === 0 && (
                      <span className="mb-1 font-mono text-[10px] text-fog">
                        {year}
                      </span>
                    )}
                    <span
                      className={cn(
                        "w-px bg-line",
                        (year - FIRST) % 3 === 0 ? "h-2" : "h-1",
                      )}
                    />
                  </span>
                ))}
              </div>

              {/* Lanes */}
              {(["study", "work"] as const).map((lane) => (
                <div
                  key={lane}
                  className="relative h-16 border-b border-line/60"
                >
                  <span className="pointer-events-none absolute left-0 top-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fog/70">
                    {tr(copy.lanes[lane])}
                  </span>
                  {ENTRIES.filter((e) => e.lane === lane).map((e) => {
                    const active = e.id === selected.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        data-entry={e.id}
                        data-swarm
                        aria-pressed={active}
                        aria-label={`${tr(e.title)}, ${tr(e.period)}`}
                        title={tr(e.title)}
                        // Keyboard Enter / Space (a mouse picks on pointerdown).
                        onClick={(ev) =>
                          ev.detail === 0 && seek(e.start + 0.01, e)
                        }
                        className="absolute bottom-2 h-7 min-w-3 rounded-sm outline-offset-2"
                        style={{
                          left: `${pct(e.start)}%`,
                          width: `${pct(endOf(e)) - pct(e.start)}%`,
                        }}
                      >
                        <span
                          ref={(el) => {
                            if (el) bars.current.set(e.id, el);
                            else bars.current.delete(e.id);
                          }}
                          className={cn(
                            "absolute inset-0 flex items-center overflow-hidden rounded-sm border px-2 font-mono text-[11px] transition-colors duration-300",
                            active
                              ? "border-signal bg-signal text-ink"
                              : lane === "work"
                                ? "border-signal/50 bg-signal/15 text-bone hover:bg-signal/30"
                                : "border-line bg-graphite text-fog hover:border-fog hover:text-bone",
                          )}
                        >
                          <span className="truncate">{tr(e.title)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Playhead */}
              <div
                ref={head}
                aria-hidden
                className="pointer-events-none absolute bottom-0 top-3 w-px bg-signal"
              >
                <span
                  ref={headLabel}
                  className="absolute -top-1 left-0 -translate-x-1/2 -translate-y-full rounded-sm bg-signal px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink"
                />
                <span className="absolute left-0 top-0 size-2 -translate-x-1/2 rotate-45 bg-signal" />
              </div>
            </div>
          </div>
        </Build>

        {/* The selected part of the story */}
        <Build label="Frame · details" className="mt-14 md:mt-20">
          <div
            ref={details}
            aria-live="polite"
            className="grid gap-x-4 gap-y-8 border-t border-line pt-10 md:grid-cols-12"
          >
            <div className="md:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
                {tr(copy.lanes[selected.lane])} · {tr(selected.period)}
              </p>
              <h3 className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.015em]">
                {tr(
                  selected.lane === "work" ? selected.subtitle : selected.title,
                )}
              </h3>
              <p className="mt-2 text-lg text-bone/80">
                {selected.lane === "work"
                  ? tr(selected.title)
                  : `${tr(selected.subtitle)}${selected.level ? ` · ${tr(selected.level)}` : ""}`}
              </p>
              {selected.body && (
                <p className="mt-5 max-w-xl leading-relaxed text-fog">
                  {tr(selected.body)}
                </p>
              )}
              {selected.tags && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {selected.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fog"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-5">
              {selected.gpa !== undefined ? (
                <GpaMeter gpa={selected.gpa} />
              ) : (
                stat && (
                  <p className="flex items-baseline gap-2 md:justify-end">
                    <span className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
                      {stat.value}
                    </span>
                    <span className="font-mono text-xs text-fog">
                      {tr(stat.unit)}
                    </span>
                  </p>
                )
              )}
            </div>
          </div>
        </Build>
      </div>
    </section>
  );
};

export default CareerSection;
