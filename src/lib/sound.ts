import { createStore, readSetting, writeSetting } from "@/lib/store";

// Optional interface sounds, synthesised live with the Web Audio API.
// Off by default; the visitor turns them on.
export const soundOn = createStore(readSetting("sound") === "on");

let ctx: AudioContext | null = null;
const audio = () => {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

export function setSound(on: boolean) {
  soundOn.set(on);
  writeSetting("sound", on ? "on" : "off");
  if (on) blip({ pitch: 1.5 }); // confirm, and unlock audio inside the click
}

// Pan a sound towards where it happens on screen: -1 left, 1 right.
export const panFor = (x: number) =>
  Math.max(-1, Math.min(1, (x / window.innerWidth) * 2 - 1));

// A short mouse-click: falling triangle chirp.
export function click({ pitch = 1, pan = 0, gain = 0.05 } = {}) {
  if (!soundOn.get()) return;
  const c = audio();
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
  if (!soundOn.get()) return;
  const c = audio();
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
