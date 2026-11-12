import { useEffect, useState } from "react";
import { navItems, profile } from "@/data/portfolio";
import { ScrollSmoother } from "@/lib/gsap";
import { setLang, ui, useLang, useT } from "@/lib/i18n";
import { useGoToSection, usePathname } from "@/lib/navigation";
import { paletteOpen } from "@/lib/store";
import { cn } from "@/lib/utils";
import Build from "@/components/build";

// Scroll position at which a section's top reaches the top of the viewport.
const sectionTop = (el: HTMLElement) => {
  const smoother = ScrollSmoother.get();
  return smoother
    ? smoother.offset(el, "top top")
    : el.getBoundingClientRect().top + window.scrollY;
};

const LangToggle = () => {
  const lang = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "mn" : "en")}
      aria-label={lang === "en" ? "Монгол хэл рүү шилжих" : "Switch to English"}
      className="font-mono text-xs uppercase tracking-[0.16em]"
    >
      <span className={cn(lang === "en" ? "text-bone" : "text-fog")}>EN</span>
      <span className="mx-1.5 text-line">/</span>
      <span className={cn(lang === "mn" ? "text-bone" : "text-fog")}>MN</span>
    </button>
  );
};

const Header = () => {
  const tr = useT();
  const pathname = usePathname();
  const goToSection = useGoToSection();
  const [section, setSection] = useState("home");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Case study pages live under "work"; other pages highlight nothing.
  const active =
    pathname === "/" ? section : pathname.startsWith("/work") ? "work" : "";

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
      let current = navItems[0].id;
      for (const { id } of navItems) {
        const el = document.getElementById(id);
        if (el && y >= sectionTop(el) - window.innerHeight * 0.4) current = id;
      }
      setSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    ScrollSmoother.get()?.paused(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    goToSection(id);
  };

  return (
    <>
      <header
        id="site-header"
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[translate,background-color,border-color] duration-500 ease-out",
          hidden && !open && "-translate-y-full",
          scrolled && !open && "border-line bg-ink/75 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 md:px-10 md:py-6">
          <Build
            label="Logo"
            immediate
            delay={0.2}
            frameClassName="-inset-x-2 -inset-y-1"
          >
            <a
              href="/#home"
              onClick={(e) => go(e, "home")}
              className="font-display text-2xl font-bold tracking-tight"
            >
              bil9uun<span className="animate-caret text-signal">_</span>
            </a>
          </Build>

          <nav aria-label="Sections" className="hidden xl:block">
            <ul className="flex gap-10">
              {navItems.map(({ id, label }, i) => {
                const isActive = active === id;
                return (
                  <li key={id}>
                    <Build
                      label={`Nav · ${id}`}
                      immediate
                      delay={0.35 + i * 0.08}
                      frameClassName="-inset-x-2 -inset-y-1"
                    >
                      <a
                        href={`/#${id}`}
                        onClick={(e) => go(e, id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "group flex flex-col font-mono text-[13px] transition-colors duration-300",
                          isActive ? "text-bone" : "text-fog hover:text-bone",
                        )}
                      >
                        <span className="self-end text-[10px] text-fog">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="whitespace-nowrap">
                          <span
                            className={cn(
                              "mr-2 transition-colors duration-300",
                              isActive
                                ? "text-signal"
                                : "text-line group-hover:text-fog",
                            )}
                          >
                            //
                          </span>
                          {tr(label)}
                        </span>
                      </a>
                    </Build>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Build
            label="Controls"
            immediate
            delay={0.8}
            frameClassName="-inset-x-2 -inset-y-1.5"
          >
            <div className="flex items-center gap-5">
              <LangToggle />
              <button
                type="button"
                onClick={() => paletteOpen.set(true)}
                aria-label={tr(ui.searchCommands)}
                className="hidden rounded border border-line px-2 py-1 font-mono text-[11px] text-fog transition-colors hover:border-signal hover:text-bone md:block"
              >
                ⌘K
              </button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="font-mono text-xs uppercase tracking-[0.2em] xl:hidden"
              >
                {tr(open ? ui.close : ui.menu)}
              </button>
            </div>
          </Build>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-12 pt-28 transition-[opacity,visibility] duration-500 xl:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Sections">
          <ul>
            {navItems.map(({ id, label }, i) => (
              <li
                key={id}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
                className={cn(
                  "transition-[opacity,translate] duration-700 ease-out",
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0",
                )}
              >
                <a
                  href={`/#${id}`}
                  onClick={(e) => go(e, id)}
                  className="flex items-baseline gap-4 border-b border-line py-4 font-display text-[clamp(2.25rem,10vw,3rem)] font-semibold tracking-tight"
                >
                  <span className="font-mono text-xs text-fog">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(active === id && "text-signal")}>
                    {tr(label)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={`mailto:${profile.email}`}
          className="mt-10 font-mono text-sm text-fog"
        >
          {profile.email}
        </a>
      </div>
    </>
  );
};

export default Header;
