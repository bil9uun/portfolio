import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import Build from "@/components/build";
import { SKILLS } from "@/components/games/canvas";
import {
  education,
  experience,
  expertise,
  profile,
  projects,
} from "@/data/portfolio";
import { unlock } from "@/lib/achievements";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { t, ui, useT } from "@/lib/i18n";
import { usePageReady } from "@/lib/navigation";
import { click } from "@/lib/sound";
import { releaseCursor, requestCursor } from "@/lib/swarm";

export const Route = createFileRoute("/cv")({ component: CvPage });

const copy = {
  back: t("Back home", "Нүүр хуудас руу буцах"),
  print: t("Print or save as PDF", "Хэвлэх / PDF хадгалах"),
  hint: t(
    "Choose “Save as PDF” in the print window to download it.",
    "Татахын тулд хэвлэх цонхноос “Save as PDF”-ийг сонгоно уу.",
  ),
  strengths: t("Strengths", "Давуу тал"),
  experience: t("Experience", "Ажлын туршлага"),
  projects: t("Projects", "Төслүүд"),
  education: t("Education", "Боловсрол"),
  skills: t("Skills", "Ур чадвар"),
  contact: t("Contact", "Холбоо барих"),
};

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 border-b border-ink/15 pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink/60">
    {children}
  </h2>
);

function CvPage() {
  const tr = useT();
  usePageReady();
  const sheet = useRef<HTMLElement>(null);
  const scan = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const site = window.location.host;

  useEffect(() => {
    const done = () => unlock("cv");
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  // A cursor runs a print head down the sheet, then the print window opens.
  const print = () => {
    if (busy.current) return;
    if (prefersReducedMotion() || !sheet.current || !scan.current) {
      window.print();
      return;
    }
    busy.current = true;
    const r = sheet.current.getBoundingClientRect();
    const top = Math.max(r.top, 0);
    const bottom = Math.min(r.bottom, window.innerHeight);
    const head = { y: top, ticks: 0 };
    const line = scan.current;
    Object.assign(line.style, { left: `${r.left}px`, width: `${r.width}px` });
    const task = requestCursor(() => ({ x: r.right - 12, y: head.y }));

    gsap
      .timeline({
        onComplete: () => {
          releaseCursor(task);
          busy.current = false;
          window.print();
        },
      })
      .set(line, { autoAlpha: 1, y: top })
      .to(head, {
        y: bottom,
        duration: 1.1,
        ease: "power1.inOut",
        onUpdate: () => {
          gsap.set(line, { y: head.y });
          const tick = Math.floor((head.y - top) / 40);
          if (tick !== head.ticks) {
            head.ticks = tick;
            click({ pitch: 0.7, gain: 0.02 });
          }
        },
      })
      .to(line, { autoAlpha: 0, duration: 0.2 });
  };

  return (
    <div
      data-cv-page
      className="mx-auto w-full max-w-5xl px-4 pb-32 pt-32 md:px-10 md:pt-40"
    >
      <div
        data-print-hide
        className="mx-auto mb-8 flex max-w-[820px] flex-wrap items-center justify-between gap-4"
      >
        <Build label="Link · back" immediate delay={0.2} className="w-fit">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-bone"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {tr(copy.back)}
          </Link>
        </Build>
        <Build label="Button · print" immediate delay={0.3} className="w-fit">
          <button
            type="button"
            onClick={print}
            data-swarm
            className="inline-flex items-center gap-2 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
          >
            <Printer aria-hidden className="size-4" />
            {tr(copy.print)}
          </button>
        </Build>
      </div>

      <article
        ref={sheet}
        data-cv
        className="mx-auto max-w-[820px] rounded-sm bg-bone px-6 py-10 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:px-12 sm:py-14"
      >
        <Build label="Header" immediate delay={0.45}>
          <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-5xl font-bold leading-none tracking-[-0.03em] sm:text-6xl">
                {profile.name}
              </h1>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.14em] text-ink/70">
                {tr(ui.roleLead)} {tr(ui.roleRest)} {tr(ui.roleAccent)}
              </p>
            </div>
            <ul className="space-y-1 font-mono text-xs text-ink/75 sm:text-right">
              <li>{profile.email}</li>
              <li>{profile.phone.label}</li>
              <li>{tr(profile.location)}</li>
              <li>{site}</li>
            </ul>
          </header>
        </Build>

        <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_15rem] print:grid-cols-[1fr_52mm]">
          <div className="space-y-10">
            <Build label="Section · experience" delay={0.1}>
              <section>
                <Heading>{tr(copy.experience)}</Heading>
                <ul className="space-y-5">
                  {experience.map((job) => (
                    <li key={job.org} className="break-inside-avoid">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-display text-lg font-semibold tracking-tight">
                          {tr(job.role)} · {job.org}
                        </span>
                        <span className="font-mono text-[11px] text-ink/60">
                          {tr(job.period)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/80">
                        {tr(job.summary)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Build>

            <Build label="Section · projects" delay={0.1}>
              <section>
                <Heading>{tr(copy.projects)}</Heading>
                <ul className="space-y-5">
                  {projects.map((project) => (
                    <li key={project.slug} className="break-inside-avoid">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-display text-lg font-semibold tracking-tight">
                          {project.title}
                        </span>
                        <span className="font-mono text-[11px] text-ink/60">
                          {project.year}
                        </span>
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/60">
                        {tr(project.role)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/80">
                        {tr(project.description)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Build>
          </div>

          <aside className="space-y-10">
            <Build label="Section · strengths" delay={0.15}>
              <section>
                <Heading>{tr(copy.strengths)}</Heading>
                <ul className="space-y-4">
                  {expertise.map((item) => (
                    <li key={item.title.en} className="break-inside-avoid">
                      <p className="text-sm font-semibold">{tr(item.title)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink/75">
                        {tr(item.body)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Build>

            <Build label="Section · education" delay={0.15}>
              <section>
                <Heading>{tr(copy.education)}</Heading>
                <ul className="space-y-4">
                  {education.map((item) => (
                    <li key={item.period} className="break-inside-avoid">
                      <p className="text-sm font-semibold">{tr(item.school)}</p>
                      <p className="mt-0.5 text-xs text-ink/75">
                        {tr(item.credential)}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink/60">
                        {item.period} · {tr(ui.gpa)} {item.gpa.toFixed(1)}/4.0
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Build>

            <Build label="Section · skills" delay={0.15}>
              <section>
                <Heading>{tr(copy.skills)}</Heading>
                <ul className="flex flex-wrap gap-1.5">
                  {SKILLS.map(([name]) => (
                    <li
                      key={name}
                      className="rounded-sm border border-ink/15 px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </section>
            </Build>
          </aside>
        </div>
      </article>

      <p
        data-print-hide
        className="mx-auto mt-6 max-w-[820px] text-center font-mono text-xs text-fog"
      >
        {tr(copy.hint)}
      </p>

      {/* The print head that sweeps the sheet. Portalled: the page content
          is transformed by the smooth scroller, which breaks position: fixed. */}
      {createPortal(
        <div
          ref={scan}
          aria-hidden
          data-print-hide
          style={{ visibility: "hidden" }}
          className="pointer-events-none fixed left-0 top-0 z-40 h-16 -translate-y-full bg-gradient-to-b from-transparent to-signal/25 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-signal after:shadow-[0_0_16px_#22c55e]"
        />,
        document.body,
      )}
    </div>
  );
}
