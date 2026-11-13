import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

export { gsap, ScrollTrigger, ScrollSmoother, useGSAP };

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToSection(id: string) {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.paused(false);
    smoother.scrollTo(`#${id}`, true, "top top");
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

export function scrollToTop(smooth = true) {
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(0, smooth);
  else window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}

// Runs `play` once, the first time `trigger` scrolls past `start`.
// Not `once: true`: a trigger that is already past when created (e.g. after
// a replay) would kill itself in the middle of ScrollTrigger's refresh and
// crash it. This one is killed a frame later instead.
export function onceInView(
  trigger: Element,
  play: (self: ScrollTrigger) => void,
  start = "top 75%",
) {
  let done = false;
  const st = ScrollTrigger.create({
    trigger,
    start,
    onEnter: (self) => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => st.kill());
      play(self);
    },
  });
  return st;
}
