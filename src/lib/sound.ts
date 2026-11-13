import { createStore, readSetting, writeSetting } from "@/lib/store";

// Optional interface sounds, synthesised live with the Web Audio API.
// Off by default; the visitor turns them on.
export const soundOn = createStore(readSetting("sound") === "on");

// Browsers decide when a page may make sound. Most allow it only after the
// visitor clicks, taps or presses a key; some allow it straight away, for
// sites the visitor has allowed autoplay on or plays media on often.
// We try at once, and otherwise wait for the first gesture. `soundLocked`
// is true while the visitor wants sound but the browser is holding it back.
const activated = () => navigator.userActivation?.hasBeenActive ?? true;
export const soundLocked = createStore(soundOn.get());

let ctx: AudioContext | null = null;
const context = () => {
  if (!ctx) {
    ctx = new AudioContext();
    const sync = () =>
      soundLocked.set(soundOn.get() && ctx!.state !== "running");
    ctx.onstatechange = sync;
    sync();
  }
  return ctx;
};

const audio = () => {
  // Before any gesture, only use a context the browser already let run.
  if (!activated()) return ctx?.state === "running" ? ctx : null;
  const c = context();
  if (c.state === "suspended") void c.resume();
  return c;
};

// Sound was left on: try now. Where the browser allows it, sound starts
// without a click; elsewhere this stays suspended until the first gesture.
if (soundOn.get())
  void context()
    .resume()
    .catch(() => {});

// Unlock on the first gesture, so sounds play from then on.
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;
const unlock = () => {
  GESTURES.forEach((e) => window.removeEventListener(e, unlock, true));
  if (soundOn.get()) audio();
};
GESTURES.forEach((e) =>
  window.addEventListener(e, unlock, { capture: true, passive: true }),
);

export function setSound(on: boolean) {
  soundOn.set(on);
  writeSetting("sound", on ? "on" : "off");
  if (!on) soundLocked.set(false);
  if (on) blip({ pitch: 1.5 }); // confirm, and unlock audio inside the click
}

// Pan a sound towards where it happens on screen: -1 left, 1 right.
export const panFor = (x: number) =>
  Math.max(-1, Math.min(1, (x / window.innerWidth) * 2 - 1));

// A short mouse-click: falling triangle chirp.
export function click({ pitch = 1, pan = 0, gain = 0.05 } = {}) {
  const c = soundOn.get() ? audio() : null;
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const amp = c.createGain();
  const panner = c.createStereoPanner();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1800 * pitch, now);
  osc.frequency.exponentialRampToValueAtTime(500 * pitch, now + 0.035);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  panner.pan.value = pan;
  osc.connect(amp).connect(panner).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

// E major pentatonic, low to high.
const NOTES = [329.63, 369.99, 415.3, 493.88, 554.37, 659.25, 739.99, 830.61];

// A soft glassy note. `size` 0..1: big things play low, small things high.
export function blip({ size = 0.5, pitch = 1, pan = 0, gain = 0.035 } = {}) {
  const c = soundOn.get() ? audio() : null;
  if (!c) return;
  const now = c.currentTime;
  const index = Math.round(
    (1 - Math.max(0, Math.min(1, size))) * (NOTES.length - 1),
  );
  const osc = c.createOscillator();
  const amp = c.createGain();
  const panner = c.createStereoPanner();
  osc.type = "sine";
  osc.frequency.value = NOTES[index] * pitch;
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  panner.pan.value = pan;
  osc.connect(amp).connect(panner).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.65);
}
