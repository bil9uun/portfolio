import { useRef } from "react";
import SectionHeading from "@/components/section-heading";
import type { TimelineItem } from "@/data/portfolio";
import Build from "@/components/build";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useT } from "@/lib/i18n";

type Props = {
  id: "experience";
  items: TimelineItem[];
};

// A dated list (work history, education) on a line that fills as you scroll.
const TimelineSection = ({ id, items }: Props) => {
  const tr = useT();
  const list = useRef<HTMLDivElement>(null);

  // Each dot lights up as the line passes it.
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.utils
          .toArray<HTMLElement>("[data-dot]")
          .forEach((dot) => dot.classList.add("is-active"));
        return;
      }
      gsap.fromTo(
        "[data-progress]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-dot]").forEach((dot) =>
        ScrollTrigger.create({
          trigger: dot,
          start: "top 60%",
          toggleClass: { targets: dot, className: "is-active" },
        }),
      );
    },
    { scope: list },
  );

  return (
    <section id={id} className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id={id} />

        <div ref={list} className="relative mt-16 md:mt-24">
          <div
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px bg-line md:left-[calc(13rem+7px)]"
          >
            <div data-progress className="size-full origin-top bg-signal" />
          </div>

          <ol>
            {items.map((item) => (
              <li
                key={item.period.en + item.org}
                className="relative pb-16 pl-10 last:pb-0 md:grid md:grid-cols-[13rem_1fr] md:pl-0"
              >
                <span
                  data-dot
                  aria-hidden
                  className="absolute left-0 top-1.5 size-[15px] rounded-full border border-line bg-ink transition-colors duration-500 md:left-[13rem] [&.is-active]:border-signal [&.is-active]:bg-signal [&.is-active]:shadow-[0_0_0_6px_rgba(34,197,94,0.15)]"
                />
                <p className="font-mono text-sm text-fog md:pr-10 md:pt-1">
                  {tr(item.period)}
                </p>
                <Build
                  label={`Item · ${item.org}`}
                  className="mt-2 md:mt-0 md:ml-14"
                >
                  <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                    {tr(item.role)}
                  </h3>
                  <p className="mt-1 text-fog">{item.org}</p>
                  <p className="mt-5 max-w-2xl leading-relaxed text-bone/80">
                    {tr(item.summary)}
                  </p>
                  {item.tags.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fog"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </Build>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
