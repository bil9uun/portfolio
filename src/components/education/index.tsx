import { useRef } from "react";
import Build from "@/components/build";
import SectionHeading from "@/components/section-heading";
import { education } from "@/data/portfolio";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const SCALE = 4; // GPA scale
const TICKS = 40; // one tick per 0.1

// GPA on a ruler: one tick per 0.1, taller ticks at each whole point.
const GpaMeter = ({ gpa }: { gpa: number }) => {
  const filled = Math.round((gpa / SCALE) * TICKS);
  return (
    <div
      data-meter
      role="meter"
      aria-label="GPA"
      aria-valuemin={0}
      aria-valuemax={SCALE}
      aria-valuenow={gpa}
      className="w-full md:max-w-64 md:ml-auto"
    >
      <p className="flex items-baseline gap-2 md:justify-end">
        <span
          data-gpa={gpa}
          className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl"
        >
          {gpa.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-fog">
          / {SCALE.toFixed(1)} GPA
        </span>
      </p>
      <div aria-hidden className="mt-4 flex h-6 items-end justify-between">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            data-tick={i < filled ? "on" : "off"}
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

const EducationSection = () => {
  const list = useRef<HTMLOListElement>(null);

  // Each meter fills tick by tick and its number counts up as it scrolls in.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-meter]").forEach((meter) => {
        const label = meter.querySelector<HTMLElement>("[data-gpa]")!;
        const target = Number(label.dataset.gpa);
        const count = { value: 0 };
        gsap
          .timeline({
            scrollTrigger: { trigger: meter, start: "top 85%", once: true },
            delay: 0.5,
          })
          .from(meter.querySelectorAll('[data-tick="on"]'), {
            scaleY: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.015,
          })
          .to(
            count,
            {
              value: target,
              duration: 0.9,
              ease: "power2.out",
              onUpdate: () => {
                label.textContent = count.value.toFixed(1);
              },
            },
            0,
          );
      });
    },
    { scope: list },
  );

  return (
    <section id="education" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading index="05" label="education" title="Education" />

        <ol ref={list} className="mt-16 border-b border-line md:mt-24">
          {education.map((item) => (
            <li key={item.school}>
              <Build
                label={`Row · ${item.school}`}
                frameClassName="inset-x-0 inset-y-2"
              >
                <article className="grid grid-cols-12 gap-x-4 gap-y-8 border-t border-line py-10 md:py-14">
                  <p className="col-span-12 font-mono text-xs text-fog md:col-span-2 md:pt-1">
                    {item.period}
                  </p>
                  <div className="col-span-12 md:col-span-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
                      {item.level}
                    </p>
                    <h3 className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.015em]">
                      {item.school}
                    </h3>
                    <p className="mt-3 text-lg text-bone/80">
                      {item.credential}
                    </p>
                    {item.note && (
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <GpaMeter gpa={item.gpa} />
                  </div>
                </article>
              </Build>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default EducationSection;
