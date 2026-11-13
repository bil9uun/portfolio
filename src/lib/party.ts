import { blip } from "@/lib/sound";
import { createStore, isTyping } from "@/lib/store";
import { unlock } from "@/lib/achievements";

// Party mode: the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) sets the swarm loose,
// spins the background through every colour and makes the name dance.

const LENGTH = 10_000; // ms
export const partyUntil = createStore(0);
export const isParty = () => partyUntil.get() > performance.now();

let timer = 0;
export function startParty() {
  partyUntil.set(performance.now() + LENGTH);
  document.documentElement.classList.add("party");
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    document.documentElement.classList.remove("party");
    partyUntil.set(0);
  }, LENGTH);
  // A rising arpeggio.
  [0.9, 0.7, 0.5, 0.3, 0.1, 0].forEach((size, i) =>
    setTimeout(() => blip({ size, gain: 0.04 }), i * 90),
  );
}

const CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];
let progress = 0;
window.addEventListener("keydown", (e) => {
  if (isTyping(e.target)) return;
  const key = e.key.toLowerCase();
  if (key === CODE[progress]) progress++;
  else progress = key === CODE[0] ? 1 : 0;
  // "↑ ↑ ↑ ↓ …" is still a match: stay on the second step.
  if (progress === 0 && key === CODE[0]) progress = 1;
  if (progress === CODE.length) {
    progress = 0;
    unlock("konami");
    startParty();
  }
});
