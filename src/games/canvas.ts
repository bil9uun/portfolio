// Drawing helpers shared by the canvas games: the swarm's cursor and its label.

export type Point = { x: number; y: number };

export const INK = "#0d0f0c";
export const SIGNAL = "#22C55E";

// The swarm's cursor shape, drawn in an 18 × 20 box with the tip at (2, 2).
const ARROW = new Path2D(
  "M2 2 L2 16.4 L6.1 12.6 L8.9 18.6 L11.7 17.3 L8.9 11.4 L14.6 11.1 Z",
);
// The tip points up-left; rotate by this much less to face a direction.
const ARROW_BASE = Math.atan2(-1, -1);

/** A cursor centred on (x, y). `angle` in radians; undefined keeps it upright. */
export function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale = 1,
  angle?: number,
) {
  ctx.save();
  ctx.translate(x, y);
  if (angle !== undefined) ctx.rotate(angle - ARROW_BASE);
  ctx.scale(scale, scale);
  ctx.translate(-8, -10);
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "round";
  ctx.fill(ARROW);
  ctx.stroke(ARROW);
  ctx.restore();
}

/** A pill label like the swarm's name tags. Clamped inside [0, maxX]. */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  maxX = Infinity,
) {
  ctx.font = `500 11px ${monoFont()}`;
  const width = ctx.measureText(text).width + 12;
  const left = Math.max(2, Math.min(x, maxX - width - 2));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(left, y, width, 17, 8.5);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillText(text, left + 6, y + 12.5);
}

let mono = "";
export const monoFont = () =>
  (mono ||=
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-mono")
      .trim() || "monospace");

/** Size a canvas for crisp drawing; returns its 2D context in CSS pixels. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
