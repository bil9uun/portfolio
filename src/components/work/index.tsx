import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/section-heading";
import { projects } from "@/data/portfolio";
import Build from "@/components/build";
import { gsap, useGSAP } from "@/lib/gsap";
import { ui, useT } from "@/lib/i18n";

const PREVIEW_WIDTH = 320;

const WorkSection = () => {
  const preview = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(
    null,
  );
  const visible = useRef(false);
  const [active, setActive] = useState(0);
  const tr = useT();

  useGSAP(() => {
    gsap.set(preview.current, { autoAlpha: 0, scale: 0.85 });
    follow.current = {
      x: gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" }),
      y: gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" }),
    };
  });

  const hide = () => {
    if (!visible.current) return;
    visible.current = false;
    gsap.to(preview.current, {
      autoAlpha: 0,
      scale: 0.85,
      duration: 0.3,
      ease: "power2.in",
      overwrite: "auto", // stop a running show tween, keep the x/y follow tweens
    });
  };

  // Scrolling moves rows out from under a still pointer, so hide until it moves again.
  useEffect(() => {
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, []);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const row = (e.target as Element).closest<HTMLElement>("[data-index]");
    if (!row) return hide();

    setActive(Number(row.dataset.index));
    const x = Math.min(e.clientX + 32, window.innerWidth - PREVIEW_WIDTH - 16);
    follow.current?.x(x);
    follow.current?.y(e.clientY - 110);
    if (!visible.current) {
      visible.current = true;
      gsap.to(preview.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const current = projects[active];

  return (
    <section id="work" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="work" />

        <ul
          onPointerMove={move}
          onPointerLeave={hide}
          className="mt-16 border-b border-line md:mt-24 [&:hover>li]:opacity-35 [&>li:hover]:opacity-100"
        >
          {projects.map((project, i) => (
            <li key={project.title} className="transition-opacity duration-500">
              <Build
                label={`Row · ${project.title}`}
                frameClassName="inset-x-0 inset-y-2"
              >
                <Link
                  to="/work/$slug"
                  params={{ slug: project.slug }}
                  data-swarm
                  data-index={i}
                  className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 border-t border-line py-8 md:py-11"
                >
                  <span className="col-span-12 font-mono text-xs text-fog md:col-span-1">
                    {project.year}
                  </span>
                  <span className="col-span-11 font-display text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-none tracking-[-0.015em] transition-transform duration-500 ease-out group-hover:translate-x-3 md:col-span-6">
                    {project.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="col-span-1 size-6 self-center justify-self-end text-fog transition-all duration-500 group-hover:rotate-45 group-hover:text-signal md:order-last md:size-8"
                  />
                  <span className="col-span-12 text-sm text-fog md:col-span-4">
                    <span className="text-bone">{tr(project.role)}</span>
                    <span className="mt-1 block font-mono text-xs">
                      {project.tags.join(" · ")}
                    </span>
                  </span>
                  <span className="col-span-12 mt-2 max-w-xl text-sm leading-relaxed text-fog pointer-fine:hidden">
                    {tr(project.description)}
                  </span>
                </Link>
              </Build>
            </li>
          ))}
        </ul>
      </div>

      {createPortal(
        <div
          ref={preview}
          aria-hidden
          style={{ width: PREVIEW_WIDTH }}
          className="pointer-events-none fixed left-0 top-0 z-40 overflow-hidden rounded-lg border border-line bg-graphite shadow-[0_24px_60px_rgba(0,0,0,0.55)] pointer-coarse:hidden"
        >
          <div
            className="relative aspect-[16/10]"
            style={{
              background: `linear-gradient(135deg, ${current.colors[0]}, ${current.colors[1]})`,
            }}
          >
            <div className="canvas-grid canvas-grid--dark absolute inset-0" />
            <span className="absolute left-4 top-3 font-mono text-[11px] text-ink/70">
              {current.year}
            </span>
            <span className="absolute bottom-3 left-4 font-display text-3xl font-bold tracking-tight text-ink">
              {current.title}
            </span>
          </div>
          <p className="p-4 text-sm leading-relaxed text-fog">
            {tr(current.description)}
          </p>
          <p className="border-t border-line px-4 py-3 font-mono text-[11px] text-signal">
            {tr(ui.viewCase)} →
          </p>
        </div>,
        document.body,
      )}
    </section>
  );
};

export default WorkSection;
