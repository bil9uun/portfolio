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
