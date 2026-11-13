import { useRef, useState, type CSSProperties } from "react";
import { profile } from "@/content/portfolio";
import { localStatus, useLocalTime } from "@/hooks/use-local-time";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { guestName } from "@/lib/guest";
import { click } from "@/lib/sound";
import {
  addFrameDraw,
  releaseCursor,
  requestCursor,
  swarm,
  type SwarmTask,
} from "@/lib/swarm";
import { SelectionFrame } from "@/components/ui/build";
import { cn } from "@/lib/utils";
import { ui, useT } from "@/lib/i18n";

const LETTERS = ["B", ".", "B", "i", "l", "g", "u", "u", "n"];

const STATUS_DOT = {
  working: "bg-signal",
  free: "bg-[#FFB020]",
  asleep: "bg-[#4D8DFF]",
};

const HeroSection = () => {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const greetFrame = useRef<HTMLDivElement>(null);
  const greetBox = useRef<HTMLDivElement>(null);
  const greetBadge = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  // Letters of the greeting typed so far.
  const [typed, setTyped] = useState(() =>
    guestName && !prefersReducedMotion() ? 0 : Infinity,
  );
  const time = useLocalTime(profile.timeZone);
  const status = localStatus(profile.timeZone);
  const tr = useT();
  const greeting = guestName ? tr(ui.greeting(guestName)) : "";
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

      // A personal link: a cursor draws a text box and types the greeting.
      let typist: SwarmTask | null = null;
      let releaseGreeting = () => {};
      if (guestName) {
        releaseGreeting = addFrameDraw(
          tl,
          {
            frame: greetFrame.current!,
            box: greetBox.current!,
            badge: greetBadge.current!,
          },
          1.5,
          0.5,
        );
        const { en, mn } = ui.greeting(guestName);
        const length = Math.max(en.length, mn.length);
        const typing = { n: 0, shown: 0 };
        tl.call(
          () => {
            typist = requestCursor(() => {
              const r = caret.current?.getBoundingClientRect();
              return r ? { x: r.right + 2, y: r.bottom - 2 } : null;
            });
          },
          undefined,
          2.1,
        )
          .to(
            typing,
            {
              n: length,
              duration: length * 0.045,
              ease: "none",
              onUpdate: () => {
                const n = Math.floor(typing.n);
                if (n === typing.shown) return;
                typing.shown = n;
                if (n % 2 === 0) click({ pitch: 1.4, gain: 0.02 });
                setTyped(n);
              },
            },
            2.2,
          )
          .call(() => {
            setTyped(Infinity);
            releaseCursor(typist);
            typist = null;
          });
      }

      return () => {
        release();
        releaseGreeting();
        releaseCursor(typist);
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
        {guestName && (
          <div className="relative mb-8 md:mb-10">
            <SelectionFrame
              label="Text · greeting"
              className="-inset-x-3 -inset-y-2"
              frameRef={greetFrame}
              boxRef={greetBox}
              badgeRef={greetBadge}
            />
            <p className="relative text-left font-display text-xl font-medium tracking-tight md:text-3xl">
              {/* The full line holds the space; the typed part sits on top. */}
              <span aria-hidden className="invisible">
                {greeting}
                <span className="ml-0.5 inline-block w-[2px]" />
              </span>
              <span className="absolute inset-0">
                {greeting.slice(0, typed)}
                <span
                  ref={caret}
                  aria-hidden
                  className={cn(
                    "ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] bg-signal",
                    typed === Infinity ? "animate-caret" : "",
                  )}
                />
              </span>
            </p>
          </div>
        )}

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
                  style={{ "--i": i } as CSSProperties}
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
          <br />
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", STATUS_DOT[status])}
            />
            {tr(ui.status[status])}
          </span>
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
