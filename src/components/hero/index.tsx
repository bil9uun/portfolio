import { useRef } from "react";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { addFrameDraw, swarm } from "@/lib/swarm";
import { SelectionFrame } from "@/components/build";
import { cn } from "@/lib/utils";
import { ui, useT } from "@/lib/i18n";

const LETTERS = ["B", ".", "B", "i", "l", "g", "u", "u", "n"];

const HeroSection = () => {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const time = useLocalTime(profile.timeZone);
  const tr = useT();
  const [scrollA, scrollB] = tr(ui.scrollHint).split("|");

  // Intro: a cursor drags a selection frame around the name,
  // then the letters rise into it, like a layer being built on a canvas.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Gather the free cursors round the name, if it is on screen.
      const r = title.current!.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight)
        swarm.focus = title.current;
      const tl = gsap.timeline({ delay: 0.15 });
      const release = addFrameDraw(
        tl,
        { frame: frame.current!, box: box.current!, badge: badge.current! },
        0.45,
        0.75,
      );
      tl.from(
        "[data-letter]",
        { yPercent: 115, duration: 0.9, ease: "expo.out", stagger: 0.03 },
        0.95,
      )
        .from(
          "[data-hero-fade]",
          {
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.07,
          },
          1.25,
        )
        .call(() => void (swarm.focus = null), undefined, 1.6);

      return () => {
        release();
        swarm.focus = null;
      };
    },
    { scope: root },
  );

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6"
    >

      <div
        data-speed="0.85"
        className="relative flex flex-col items-center text-center"
      >
        <p
          data-hero-fade
          className="mb-8 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-fog md:text-xs"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative size-2 rounded-full bg-signal" />
          </span>
          {tr(ui.openToWork)}
        </p>

        <div className="relative">
          <SelectionFrame
            label="Frame · hero"
            className="-inset-x-3 -inset-y-1 md:-inset-x-8 md:-inset-y-3"
            frameRef={frame}
            boxRef={box}
            badgeRef={badge}
          />

          <h1
            ref={title}
            aria-label={profile.name}
            className="font-display text-[clamp(4.25rem,17vw,15rem)] font-bold leading-[0.88] tracking-[-0.025em] [font-stretch:92%]"
          >
            <span aria-hidden className="flex overflow-hidden pb-[0.14em]">
              {LETTERS.map((letter, i) => (
                <span
                  key={i}
                  data-letter
                  className={cn(
                    "inline-block",
                    letter === "." && "text-signal",
                  )}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>
        </div>

        <p
          data-hero-fade
          className="mt-12 text-sm font-medium uppercase leading-relaxed tracking-[0.16em] md:mt-8 md:text-[22px]"
        >
          {tr(ui.roleLead)}
          <br className="sm:hidden" /> {tr(ui.roleRest)}{" "}
          <span className="text-signal">{tr(ui.roleAccent)}</span>
        </p>
      </div>

      <div
        data-hero-fade
        className="absolute inset-x-0 bottom-6 mx-auto flex max-w-7xl items-end justify-between px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-fog md:bottom-8 md:px-10"
      >
        <p>
          {tr(profile.location)}
          <br />
          <span className="text-bone">{time}</span> {tr(ui.localTime)}
        </p>
        {/* Mouse with a scrolling wheel dot */}
        <div
          aria-hidden
          className="relative h-11 w-7 rounded-full border-[1.5px] border-bone/70"
        >
          <span className="absolute left-1/2 top-2 size-1.5 -translate-x-1/2 animate-scroll-dot rounded-full bg-signal" />
        </div>
        <p className="text-right">
          {scrollA}
          <br />
          {scrollB}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
