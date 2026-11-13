import { blip } from "@/lib/sound";
import { createStore, isTyping } from "@/lib/store";
import { unlock } from "@/lib/achievements";

// Party mode: typing a secret word ("hopie", my gamer tag, or "bilguun")
// anywhere on the page sets the swarm loose, spins the background through
// every colour and makes the name dance.

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

const WORDS = ["hopie", "bilguun"];
let typed = ""; // the last few letters typed outside of inputs

// How far into a secret word the visitor is: the longest end of what they
// typed that starts one of the words.
const progress = () => {
  let best = 0;
  for (const word of WORDS)
    for (let n = Math.min(word.length - 1, typed.length); n > best; n--)
      if (typed.endsWith(word.slice(0, n))) {
        best = n;
        break;
      }
  return best;
};

// True while a secret word is being typed, so single-key shortcuts (the "i"
// of inspect mode) can stand aside. Read during the same keydown: this
// module's listener runs first, in the capture phase.
export const typingSecret = () => progress() >= 2;

window.addEventListener(
  "keydown",
  (e) => {
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) {
      typed = "";
      return;
    }
    typed = (typed + key).slice(-12);
    if (WORDS.some((word) => typed.endsWith(word))) {
      typed = "";
      unlock("konami");
      startParty();
    }
  },
  { capture: true },
);
