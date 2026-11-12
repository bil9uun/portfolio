import type { gsap } from "@/lib/gsap";
import { blip, click, panFor } from "@/lib/sound";

type Point = { x: number; y: number };

// A job for one cursor: follow `point` exactly, e.g. a corner being dragged.
// The swarm hands each task to the nearest free cursor.
export type SwarmTask = { point: () => Point | null; agent: number };

// Shared state the cursor swarm reads every frame.
// focus: element the free cursors circle (set by code, wins over hover).
// hover: [data-swarm] element under the pointer (set by the swarm itself).
// hidden: fade the swarm out, e.g. while a game needs the visitor's focus.
export const swarm = {
  focus: null as Element | null,
  hover: null as Element | null,
  hidden: false,
  tasks: new Set<SwarmTask>(),
};

export function requestCursor(point: SwarmTask["point"]) {
  const task: SwarmTask = { point, agent: -1 };
  swarm.tasks.add(task);
  return task;
}

export function releaseCursor(task: SwarmTask | null) {
  if (task) swarm.tasks.delete(task);
}

export type FrameParts = {
  frame: HTMLElement;
  box: HTMLElement;
  badge: HTMLElement;
};

// Adds a "drag a selection frame" sequence to a timeline:
// a cursor flies to the top-left corner, drags to the bottom-right
// while a W × H badge counts up, then the frame fades away.
// Returns a cleanup that frees the cursor if the timeline is cut short.
export function addFrameDraw(
  tl: ReturnType<typeof gsap.timeline>,
  { frame, box, badge }: FrameParts,
  at: number,
  duration: number,
) {
  const draw = { p: 0 };
  let task: SwarmTask | null = null;

  const render = () => {
    const { width, height } = frame.getBoundingClientRect();
    box.style.width = `${draw.p * 100}%`;
    box.style.height = `${draw.p * 100}%`;
    badge.textContent = `${Math.round(width * draw.p)} × ${Math.round(height * draw.p)}`;
    badge.style.transform = `translate(calc(${(width * draw.p) / 2}px - 50%), ${height * draw.p + 10}px)`;
  };
  const corner = () => {
    const r = frame.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null; // hidden, e.g. display: none
    return { x: r.left + r.width * draw.p, y: r.top + r.height * draw.p };
  };
  // Only frames the visitor can see make sound.
  const onScreen = () => {
    const r = frame.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  };
  // 0..1: how much of the viewport the frame covers (big frames play low notes).
  const frameSize = () => {
    const r = frame.getBoundingClientRect();
    return Math.min(
      1,
      Math.sqrt((r.width * r.height) / (innerWidth * innerHeight)),
    );
  };
  const release = () => {
    releaseCursor(task);
    task = null;
  };

  render();
  tl.call(
    // Only send a cursor to frames on screen; off-screen ones draw alone.
    () => void (onScreen() && (task = requestCursor(corner))),
    undefined,
    Math.max(0, at - 0.25),
  )
    .fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, at)
    .fromTo(badge, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, at)
    .to(draw, { p: 1, duration, ease: "power2.inOut", onUpdate: render }, at)
    .call(
      () => void (onScreen() && click({ pan: panFor(corner()!.x) })),
      undefined,
      at,
    )
    .call(
      () =>
        void (
          onScreen() && blip({ size: frameSize(), pan: panFor(corner()!.x) })
        ),
      undefined,
      at + duration,
    )
    .call(release, undefined, at + duration + 0.05)
    .to(badge, { autoAlpha: 0, duration: 0.2 }, at + duration + 0.1)
    .to(frame, { autoAlpha: 0, duration: 0.35 }, at + duration + 0.3);

  return release;
}
