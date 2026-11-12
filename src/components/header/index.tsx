import { useEffect, useState } from "react";
import { navItems, profile } from "@/data/portfolio";
import { scrollToSection, ScrollSmoother } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Build from "@/components/build";

// Scroll position at which a section's top reaches the top of the viewport.
const sectionTop = (el: HTMLElement) => {
  const smoother = ScrollSmoother.get();
  return smoother
    ? smoother.offset(el, "top top")
    : el.getBoundingClientRect().top + window.scrollY;
};

const Header = () => {
  const [active, setActive] = useState(navItems[0]);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
      let current = navItems[0];
      for (const id of navItems) {
        const el = document.getElementById(id);
        if (el && y >= sectionTop(el) - window.innerHeight * 0.4) current = id;
      }
      setActive(current);
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
    scrollToSection(id);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[translate,background-color,border-color] duration-500 ease-out",
          hidden && !open && "-translate-y-full",
          scrolled && !open && "border-line bg-ink/75 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <Build
            label="Logo"
            immediate
            delay={0.2}
            frameClassName="-inset-x-2 -inset-y-1"
          >
            <a
              href="#home"
              onClick={(e) => go(e, "home")}
              className="font-display text-2xl font-bold tracking-tight"
            >
              bil9uun<span className="animate-caret text-signal">_</span>
            </a>
          </Build>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex gap-8 xl:gap-14">
              {navItems.map((id, i) => {
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
                        href={`#${id}`}
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
                        <span>
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
                          {id}
                        </span>
                      </a>
                    </Build>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Build
            label="Menu"
            immediate
            delay={0.35}
            className="lg:hidden"
            frameClassName="-inset-x-2 -inset-y-1.5"
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="font-mono text-xs uppercase tracking-[0.2em]"
            >
              {open ? "Close" : "Menu"}
            </button>
          </Build>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-12 pt-28 transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Sections">
          <ul>
            {navItems.map((id, i) => (
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
                  href={`#${id}`}
                  onClick={(e) => go(e, id)}
                  className="flex items-baseline gap-4 border-b border-line py-4 font-display text-5xl font-semibold tracking-tight"
                >
                  <span className="font-mono text-xs text-fog">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(active === id && "text-signal")}>
                    {id}
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
