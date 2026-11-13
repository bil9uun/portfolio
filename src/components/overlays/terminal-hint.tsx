import { useEffect, useRef, useState } from "react";
import { unlocked } from "@/lib/achievements";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ui, useT } from "@/lib/i18n";
import { blip } from "@/lib/sound";
import { readSetting, terminalOpen, writeSetting } from "@/lib/store";
import { releaseCursor, requestCursor } from "@/lib/swarm";

const KEY = "terminal-hint";
const WAIT = 6000; // ms after load, once the hero has built
const SHOW_FOR = 8000;

// First visit only: a swarm cursor flies up to the header's >_ button and
// whispers that there's a terminal. Never shown again after that.
const TerminalHint = () => {
  const tr = useT();
  const [show, setShow] = useState(false);
  const bubble = useRef<HTMLButtonElement>(null);
  const touch = window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (readSetting(KEY) || unlocked.get().has("terminal")) return;
    const id = setTimeout(() => {
      // Only at the top of the page, where the header is in view.
      if (window.scrollY < 120 && !terminalOpen.get()) setShow(true);
    }, WAIT);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = bubble.current;
    const button = document.getElementById("terminal-button");
    if (!show || !el || !button) return;
    writeSetting(KEY, "seen");

    // Sit just under the button, right edges aligned.
    let raf = 0;
    const place = () => {
      const r = button.getBoundingClientRect();
      el.style.left = `${r.right - el.offsetWidth}px`;
      el.style.top = `${r.bottom + 14}px`;
      raf = requestAnimationFrame(place);
    };
    place();

    const cursor = requestCursor(() => {
      const r = el.getBoundingClientRect();
      return { x: r.right - 10, y: r.top - 4 };
    });
    blip({ size: 0.3, pitch: 1.2 });
    if (!prefersReducedMotion())
      gsap.from(el, {
        autoAlpha: 0,
        y: -8,
        scale: 0.9,
        transformOrigin: "100% 0%",
        duration: 0.5,
        delay: 0.3,
        ease: "back.out(1.8)",
      });

    const hide = () => setShow(false);
    const timer = setTimeout(hide, SHOW_FOR);
    const onScroll = () => window.scrollY > 120 && hide();
    window.addEventListener("scroll", onScroll, { passive: true });
    const unsubscribe = terminalOpen.subscribe(hide);

    return () => {
      cancelAnimationFrame(raf);
      releaseCursor(cursor);
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      unsubscribe();
    };
  }, [show]);

  if (!show) return null;
  const [before, after] = tr(
    touch ? ui.terminalHint.touch : ui.terminalHint.keys,
  ).split("{key}");

  return (
    <button
      ref={bubble}
      type="button"
      onClick={() => terminalOpen.set(true)}
      className="fixed z-[61] max-w-[min(18rem,80vw)] rounded-2xl rounded-tr-sm bg-signal px-3 py-2 text-left text-sm font-medium text-ink shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
    >
      {before}
      <kbd className="mx-0.5 rounded bg-ink/15 px-1.5 py-px font-mono text-[13px]">
        {touch ? ">_" : "`"}
      </kbd>
      {after}
    </button>
  );
};

export default TerminalHint;
