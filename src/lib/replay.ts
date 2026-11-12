import { gsap } from "@/lib/gsap";
import { blip } from "@/lib/sound";
import { replayClock } from "@/lib/navigation";
import { replayCount } from "@/lib/store";

// The parts of the page that get wiped and rebuilt.
export const REBUILT = "#site-header, #smooth-content";

// Wipe the page back to a blank canvas, then remount it in place so every
// Build runs again and the cursors redraw what the visitor is looking at.
export function replayBuild() {
  blip({ size: 0.9 });
  gsap.to(REBUILT, {
    autoAlpha: 0,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      replayClock.at = performance.now();
      replayCount.set(replayCount.get() + 1);
    },
  });
}
