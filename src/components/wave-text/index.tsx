import { useEffect, useRef } from "react";

// Big type that leans towards the pointer: letters near it get heavier and
// narrower (Bricolage Grotesque's wght and wdth axes), easing back as it
// leaves. Mongolian falls back to Geologica, which only has wght; the
// width axis is then simply ignored.

const QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const RADIUS = 220; // px of influence round the pointer
const BASE = { wght: 600, wdth: 100 };
const PEAK = { wght: 800, wdth: 78 };

const WaveText = ({ text }: { text: string }) => {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia(QUERY).matches) return;
    const letters = [...el.querySelectorAll<HTMLElement>("[data-l]")];
    const level = letters.map(() => 0); // 0 at rest, 1 under the pointer
    const pointer = { x: -1e4, y: -1e4 };
    let raf = 0;

    const tick = () => {
      let busy = false;
      letters.forEach((letter, i) => {
        const r = letter.getBoundingClientRect();
        const d = Math.hypot(
          pointer.x - (r.left + r.width / 2),
          pointer.y - (r.top + r.height / 2),
        );
        const target = Math.max(0, 1 - d / RADIUS) ** 2;
        level[i] += (target - level[i]) * 0.16;
        if (Math.abs(target - level[i]) > 0.002) busy = true;
        const k = level[i];
        letter.style.fontVariationSettings = `"wght" ${(BASE.wght + (PEAK.wght - BASE.wght) * k).toFixed(0)}, "wdth" ${(BASE.wdth + (PEAK.wdth - BASE.wdth) * k).toFixed(1)}`;
      });
      raf = busy ? requestAnimationFrame(tick) : 0;
    };

    // Only work while the pointer is near, or letters are still settling.
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (raf) return;
      const r = el.getBoundingClientRect();
      const near =
        e.clientX > r.left - RADIUS &&
        e.clientX < r.right + RADIUS &&
        e.clientY > r.top - RADIUS &&
        e.clientY < r.bottom + RADIUS;
      if (near || level.some((v) => v > 0.002))
        raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      letters.forEach((l) => (l.style.fontVariationSettings = ""));
    };
  }, [text]);

  return (
    <span ref={root}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, w) => (
          <span key={w}>
            {w > 0 && " "}
            {/* Words never break between letters. */}
            <span className="whitespace-nowrap">
              {[...word].map((ch, i) => (
                <span key={i} data-l>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
};

export default WaveText;
