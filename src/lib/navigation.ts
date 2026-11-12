import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { scrollToSection, ScrollSmoother, ScrollTrigger } from "@/lib/gsap";

export const usePathname = () =>
  useRouterState({ select: (state) => state.location.pathname });

// Scroll to a home-page section, leaving a case study page first if needed.
export function useGoToSection() {
  const navigate = useNavigate();
  const pathname = usePathname();
  return (id: string) => {
    if (pathname === "/") scrollToSection(id);
    else void navigate({ to: "/", hash: id });
  };
}

// When the page was last replayed. A replay remounts the page in place,
// so for a moment afterwards the URL hash must not pull the view away.
export const replayClock = { at: -Infinity };

// Call once per page: re-measure scroll triggers for the new content and
// jump to the section named in the URL hash, if any.
export function usePageReady() {
  const hash = useRouterState({ select: (state) => state.location.hash });
  useEffect(() => {
    ScrollTrigger.refresh();
    if (!hash || performance.now() - replayClock.at < 1000) return;
    const frame = requestAnimationFrame(() => {
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.scrollTo(`#${hash}`, false, "top top");
      else document.getElementById(hash)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
}
