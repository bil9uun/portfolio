import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Build from "@/components/build";
import Footer from "@/components/footer";
import { navItems, projects, type Project } from "@/data/portfolio";
import { ui, useT } from "@/lib/i18n";
import { unlock } from "@/lib/achievements";
import { usePageReady } from "@/lib/navigation";

export const Route = createFileRoute("/work/$slug")({
  component: CaseStudyPage,
});

const shell = "mx-auto w-full max-w-7xl px-6 md:px-10";
const label = "font-mono text-xs uppercase tracking-[0.2em] text-signal";

function CaseStudyPage() {
  const { slug } = Route.useParams();
  usePageReady();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return <NotFound />;
  const next = projects[(index + 1) % projects.length];
  // Keyed by slug so moving to the next project rebuilds the page.
  return <CaseStudy key={slug} project={projects[index]} next={next} />;
}

function CaseStudy({ project, next }: { project: Project; next: Project }) {
  const tr = useT();
  useEffect(() => unlock("case"), []);
  const work = navItems.find((item) => item.id === "work")!;
  const position = navItems.indexOf(work) + 1;
  const external = project.url.startsWith("http");

  return (
    <article>
      <div className={`${shell} pt-36 md:pt-44`}>
        <Build label="Link · back" immediate delay={0.2} className="w-fit">
          <Link
            to="/"
            hash="work"
            className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-bone"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {tr(ui.backToWork)}
          </Link>
        </Build>

        <Build
          label={`Heading · ${project.title}`}
          immediate
          delay={0.3}
          className="mt-10 w-fit"
          frameClassName="-inset-x-3 -inset-y-2"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
            <span className="text-signal">
              {String(position).padStart(2, "0")}
            </span>{" "}
            // {tr(work.label)} / {project.year}
          </p>
          <h1 className="mt-5 font-display text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]">
            {project.title}
          </h1>
        </Build>

        <Build label="Meta" immediate delay={0.45} className="mt-14">
          <dl className="grid grid-cols-2 items-start gap-x-6 gap-y-8 border-t border-line pt-8 md:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                {tr(ui.role)}
              </dt>
              <dd className="mt-2">{tr(project.role)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                {tr(ui.year)}
              </dt>
              <dd className="mt-2">{project.year}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                {tr(ui.stack)}
              </dt>
              <dd className="mt-2">{project.tags.join(", ")}</dd>
            </div>
            {external && (
              <div className="md:justify-self-end">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  data-swarm
                  className="inline-flex items-center gap-2 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
                >
                  {tr(ui.visitSite)}
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </dl>
        </Build>
      </div>

      <div className={`${shell} mt-16`}>
        <Build
          label="Frame · cover"
          immediate
          delay={0.6}
          frameClassName="-inset-2"
        >
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line md:aspect-[21/9]"
            style={{
              background: `linear-gradient(135deg, ${project.colors[0]}, ${project.colors[1]})`,
            }}
          >
            <div className="canvas-grid canvas-grid--dark absolute inset-0" />
            <p className="absolute left-5 top-4 font-mono text-xs text-ink/70 md:left-8 md:top-6">
              {project.year} · {project.tags.join(" · ")}
            </p>
            <p className="absolute bottom-5 left-5 font-display text-[clamp(2rem,6vw,5rem)] font-bold leading-none tracking-tight text-ink md:bottom-8 md:left-8">
              {project.title}
            </p>
          </div>
        </Build>
      </div>

      <div className={`${shell} py-24 md:py-36`}>
        <section className="grid gap-6 md:grid-cols-12 md:gap-8">
          <Build label="Label · overview" className="w-fit md:col-span-3">
            <h2 className={label}>{tr(ui.overview)}</h2>
          </Build>
          <Build label="Text · overview" className="md:col-span-9">
            <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-bone/90">
              {tr(project.overview)}
            </p>
          </Build>
        </section>

        <section className="mt-24 grid gap-6 md:mt-32 md:grid-cols-12 md:gap-8">
          <Build label="Label · built" className="w-fit md:col-span-3">
            <h2 className={label}>{tr(ui.whatIBuilt)}</h2>
          </Build>
          <ul className="border-t border-line md:col-span-9">
            {project.built.map((item, i) => (
              <li key={item.en}>
                <Build
                  label={`Item · ${i + 1}`}
                  delay={i * 0.06}
                  frameClassName="inset-x-0 inset-y-1"
                >
                  <p className="flex gap-5 border-b border-line py-6 text-lg leading-snug">
                    {/* Square bullet, like a selection handle */}
                    <span
                      aria-hidden
                      className="mt-2 size-2 shrink-0 border border-signal bg-ink"
                    />
                    {tr(item)}
                  </p>
                </Build>
              </li>
            ))}
          </ul>
        </section>

        <Build
          label="Link · next project"
          className="mt-32 md:mt-44"
          frameClassName="inset-x-0 -inset-y-2"
        >
          <Link
            to="/work/$slug"
            params={{ slug: next.slug }}
            data-swarm
            className="group block border-y border-line py-12"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
              {tr(ui.nextProject)}
            </span>
            <span className="mt-4 flex items-center justify-between gap-6 font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-none tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-3">
              {next.title}
              <ArrowRight
                aria-hidden
                className="size-[0.6em] shrink-0 text-fog transition-colors group-hover:text-signal"
              />
            </span>
          </Link>
        </Build>

        <Footer />
      </div>
    </article>
  );
}

function NotFound() {
  const tr = useT();
  return (
    <div
      className={`${shell} flex min-h-svh flex-col items-start justify-center gap-8`}
    >
      <p className="font-display text-4xl font-semibold">{tr(ui.notFound)}</p>
      <Link
        to="/"
        hash="work"
        className="inline-flex items-center gap-2 font-mono text-xs text-fog hover:text-bone"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        {tr(ui.backToWork)}
      </Link>
    </div>
  );
}
