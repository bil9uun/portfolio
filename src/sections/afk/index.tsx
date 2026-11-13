import { useRef } from "react";
import Build from "@/components/ui/build";
import SectionHeading from "@/components/layout/section-heading";
import { container } from "@/components/ui/styles";
import gaming from "@/content/gaming.json";
import { gsap, onceInView, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import { FaceitHud } from "@/sections/afk/faceit";
import { copy, hudOnline } from "@/sections/afk/data";
import { SteamPanel } from "@/sections/afk/steam";

// Off the clock: my Counter-Strike on FACEIT and my Steam profile, laid out
// like a game HUD. A snapshot taken at build time by scripts/gaming.mjs.

const AfkSection = () => {
  const tr = useT();
  const hud = useRef<HTMLDivElement>(null);
  const f = gaming.faceit;
  const s = gaming.steam;

  // Bring the HUD online once: numbers count up, the chart draws left to
  // right, meters fill and the scoreboard rows tick in.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !hud.current) return;
      const reveal = hud.current.querySelector("[data-reveal]");
      const setup = () => {
        gsap.set("[data-meter]", { scaleX: 0 });
        gsap.set("[data-dot], [data-row]", { autoAlpha: 0 });
        gsap.set('[data-ring="on"]', { autoAlpha: 0.15 });
        if (reveal) gsap.set(reveal, { attr: { width: 0 } });
      };
      setup();
      onceInView(
        hud.current!,
        () => {
          const tl = gsap.timeline({ delay: 0.5 });
          tl.to('[data-ring="on"]', {
            autoAlpha: 1,
            duration: 0.25,
            stagger: 0.07,
          });
          tl.call(() => hudOnline.set(true), undefined, 0);
          if (reveal)
            tl.to(
              reveal,
              { attr: { width: 820 }, duration: 1.6, ease: "power2.inOut" },
              0.1,
            );
          tl.to(
            "[data-dot]",
            { autoAlpha: 1, duration: 0.2, stagger: 0.04 },
            0.15,
          )
            .to(
              "[data-meter]",
              { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.03 },
              0.3,
            )
            .to(
              "[data-row]",
              { autoAlpha: 1, duration: 0.25, stagger: 0.05 },
              0.5,
            );
        },
        "top 70%",
      );
    },
    { scope: hud },
  );

  if (!f && !s) return null;

  return (
    <section id="afk" className="py-32 md:py-48">
      <div className={container}>
        <SectionHeading id="afk" intro={tr(copy.intro)} />

        <Build label="Frame · HUD" className="mt-16 md:mt-24">
          <div ref={hud} className="relative">
            {/* Faint scanlines over the whole HUD */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(236,237,230,0.025)_0px,rgba(236,237,230,0.025)_1px,transparent_1px,transparent_4px)]"
            />

            {f && <FaceitHud f={f} />}
            {s && <SteamPanel s={s} />}
          </div>
        </Build>
      </div>
    </section>
  );
};

export default AfkSection;
