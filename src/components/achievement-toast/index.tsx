import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { achievements, lastUnlock, unlocked } from "@/lib/achievements";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ui, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const SHOW_FOR = 3500; // ms

// Pops up in the bottom-left corner when an achievement unlocks.
const AchievementToast = () => {
  const tr = useT();
  const latest = useStore(lastUnlock);
  const count = useStore(unlocked).size;
  const [visible, setVisible] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  useEffect(() => {
    if (!latest) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), SHOW_FOR);
    return () => clearTimeout(id);
  }, [latest]);

  useEffect(() => {
    if (!card.current || prefersReducedMotion()) return;
    if (!visible && !shown.current) return; // nothing to hide yet
    shown.current = visible;
    gsap.fromTo(
      card.current,
      visible ? { y: 24, autoAlpha: 0 } : { y: 0, autoAlpha: 1 },
      {
        y: visible ? 0 : 24,
        autoAlpha: visible ? 1 : 0,
        duration: visible ? 0.5 : 0.3,
        ease: visible ? "back.out(1.6)" : "power2.in",
      },
    );
  }, [visible, latest]);

  if (!latest) return null;

  return (
    <div
      ref={card}
      role="status"
      style={
        prefersReducedMotion()
          ? { visibility: visible ? "visible" : "hidden" }
          : undefined
      }
      className="invisible fixed bottom-6 left-6 z-[56] flex items-center gap-3 rounded-lg border border-line bg-ink/95 py-3 pl-3 pr-5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur"
    >
      <span className="grid size-9 place-items-center rounded-md bg-signal/15 text-signal">
        <Trophy aria-hidden className="size-4.5" />
      </span>
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
          {tr(ui.achievementUnlocked)} · {count}/{achievements.length}
        </span>
        <span className="block font-display text-base font-semibold tracking-tight">
          {tr(latest.achievement.title)}
        </span>
      </span>
    </div>
  );
};

export default AchievementToast;
