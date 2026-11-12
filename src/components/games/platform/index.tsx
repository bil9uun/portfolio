import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import {
  drawCursor,
  drawLabel,
  fitCanvas,
  INK,
  monoFont,
  SIGNAL,
  SKILLS,
} from "@/components/games/canvas";
import { formatTime, useBest, useHideSwarm } from "@/components/games/use-best";

// Frame Runner: a small platformer where the level is made of selection
// frames. Collect the stack, dodge the bugs, reach "Ship it".

const copy = {
  start: t("← → to run · Space / ↑ to jump", "← → гүйх · Space / ↑ үсрэх"),
  startTouch: t(
    "Use the buttons below to run and jump",
    "Доорх товчоор гүйж үсэрнэ",
  ),
  shipped: t("Shipped!", "Ship хийлээ!"),
  time: t("Time", "Хугацаа"),
  best: t("Best", "Шилдэг"),
  stack: t("Stack", "Stack"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
  again: t("Run again", "Дахин гүйх"),
  restart: t("R to restart", "R дахин эхлэх"),
};

// The level, in world units. The view is 420 high; the world scrolls sideways.
const VIEW_H = 420;
const WORLD_W = 3600;
type Rect = { x: number; y: number; w: number; h: number; label: string };
const PLATFORMS: Rect[] = [
  { x: 0, y: 380, w: 600, h: 40, label: "Hero" },
  { x: 240, y: 300, w: 120, h: 16, label: "Nav" },
  { x: 420, y: 230, w: 140, h: 16, label: "Logo" },
  { x: 700, y: 380, w: 450, h: 40, label: "Section" },
  { x: 820, y: 300, w: 110, h: 16, label: "Card" },
  { x: 990, y: 240, w: 110, h: 16, label: "Card" },
  { x: 1160, y: 310, w: 90, h: 16, label: "Button" },
  { x: 1300, y: 380, w: 400, h: 40, label: "Grid" },
  { x: 1420, y: 290, w: 120, h: 16, label: "Badge" },
  { x: 1600, y: 220, w: 140, h: 16, label: "Modal" },
  { x: 1760, y: 300, w: 80, h: 16, label: "Tooltip" },
  { x: 1850, y: 380, w: 450, h: 40, label: "Table" },
  { x: 2000, y: 300, w: 100, h: 16, label: "Row" },
  { x: 2150, y: 230, w: 100, h: 16, label: "Row" },
  { x: 2310, y: 310, w: 100, h: 16, label: "Toast" },
  { x: 2450, y: 380, w: 400, h: 40, label: "Form" },
  { x: 2560, y: 300, w: 120, h: 16, label: "Input" },
  { x: 2740, y: 240, w: 120, h: 16, label: "Select" },
  { x: 2880, y: 300, w: 90, h: 16, label: "Chip" },
  { x: 3000, y: 380, w: 600, h: 40, label: "Footer" },
  { x: 3150, y: 300, w: 120, h: 16, label: "Link" },
];
const GOAL = { x: 3440, y: 300, w: 110, h: 80 };
const CHECKPOINTS = [1300, 2450];
const COINS = [
  [300, 270],
  [490, 200],
  [870, 270],
  [1040, 210],
  [1480, 260],
  [1670, 190],
  [2200, 200],
  [2610, 270],
  [2790, 210],
  [3210, 270],
].map(([x, y], i) => ({ x, y, skill: SKILLS[(i * 3) % SKILLS.length] }));
const BUGS = [
  { x1: 720, x2: 1130, y: 380 },
  { x1: 1870, x2: 2280, y: 380 },
  { x1: 3020, x2: 3380, y: 380 },
];

const GRAVITY = 1800;
const RUN = 270;
const JUMP = 640;
const PW = 16; // player box
const PH = 22;

const overlaps = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

type Phase = "ready" | "playing" | "won";

const PlatformGame = () => {
  const tr = useT();
  useHideSwarm();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [time, setTime] = useState(0);
  const [collected, setCollected] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [best, submit] = useBest("platform", "lower");
  const keys = useRef({ left: false, right: false, jump: false });
  const s = useRef({
    x: 40,
    y: 300,
    vx: 0,
    vy: 0,
    ground: false,
    facing: 1,
    coyote: 0,
    buffer: 0,
    spawn: 40,
    camera: 0,
    got: new Set<number>(),
    started: 0,
    phase: "ready" as Phase,
  });

  const reset = () => {
    Object.assign(s.current, {
      x: 40,
      y: 300,
      vx: 0,
      vy: 0,
      ground: false,
      facing: 1,
      coyote: 0,
      buffer: 0,
      spawn: 40,
      camera: 0,
      got: new Set<number>(),
      started: 0,
      phase: "ready",
    });
    setPhase("ready");
    setTime(0);
    setCollected(0);
    setNewBest(false);
  };

  const begin = (now: number) => {
    if (s.current.phase !== "ready") return;
    s.current.phase = "playing";
    s.current.started = now;
    setPhase("playing");
  };

  // Keyboard.
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      const k = keys.current;
      if (["ArrowLeft", "KeyA"].includes(e.code)) k.left = down;
      else if (["ArrowRight", "KeyD"].includes(e.code)) k.right = down;
      else if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        if (down && !k.jump) s.current.buffer = 0.12;
        k.jump = down;
      } else if (e.code === "KeyR" && down) return reset();
      else return;
      e.preventDefault();
      if (down) begin(performance.now());
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
     
  }, []);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let w = el.clientWidth;
    let h = el.clientHeight;
    let ctx = fitCanvas(cv, w, h);
    const observer = new ResizeObserver(() => {
      w = el.clientWidth;
      h = el.clientHeight;
      ctx = fitCanvas(cv, w, h);
    });
    observer.observe(el);

    const respawn = () => {
      const p = s.current;
      Object.assign(p, { x: p.spawn, y: 300, vx: 0, vy: 0 });
      blip({ size: 0.9 });
    };

    const update = (dt: number, now: number) => {
      const p = s.current;
      const k = keys.current;
      if (p.phase === "won") return;

      const dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      if (dir) p.facing = dir;
      const target = dir * RUN;
      p.vx += (target - p.vx) * Math.min(1, dt * (p.ground ? 14 : 6));

      p.coyote = p.ground ? 0.1 : Math.max(0, p.coyote - dt);
      p.buffer = Math.max(0, p.buffer - dt);
      if (p.buffer > 0 && p.coyote > 0) {
        p.vy = -JUMP;
        p.buffer = 0;
        p.coyote = 0;
        click({ pitch: 1.3, gain: 0.03 });
      }
      if (!k.jump && p.vy < -JUMP * 0.45) p.vy = -JUMP * 0.45; // short hop on release
      p.vy = Math.min(p.vy + GRAVITY * dt, 1200);

      // Move on each axis, then push out of any frame we hit.
      p.x = Math.max(0, Math.min(WORLD_W - PW, p.x + p.vx * dt));
      for (const r of PLATFORMS) {
        const box = { x: p.x, y: p.y - PH, w: PW, h: PH };
        if (overlaps(box, r)) p.x = p.vx > 0 ? r.x - PW : r.x + r.w;
      }
      p.y += p.vy * dt;
      p.ground = false;
      for (const r of PLATFORMS) {
        const box = { x: p.x, y: p.y - PH, w: PW, h: PH };
        if (!overlaps(box, r)) continue;
        if (p.vy > 0) {
          p.y = r.y;
          p.ground = true;
        } else {
          p.y = r.y + r.h + PH;
        }
        p.vy = 0;
      }

      if (p.y > VIEW_H + 80) respawn();

      for (const cp of CHECKPOINTS)
        if (p.x > cp && p.spawn < cp) p.spawn = cp + 20;

      const me = { x: p.x, y: p.y - PH, w: PW, h: PH };
      COINS.forEach((c, i) => {
        if (p.got.has(i)) return;
        if (overlaps(me, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) {
          p.got.add(i);
          setCollected(p.got.size);
          click({ pitch: 1.5 });
        }
      });

      for (const b of BUGS) {
        const bx =
          b.x1 + ((Math.sin(now / 1400 + b.x1) + 1) / 2) * (b.x2 - b.x1);
        if (overlaps(me, { x: bx - 9, y: b.y - 16, w: 18, h: 16 })) respawn();
      }

      if (overlaps(me, GOAL)) {
        p.phase = "won";
        const total = (now - p.started) / 1000;
        setTime(total);
        setPhase("won");
        setNewBest(submit(Math.round(total * 10) / 10));
        blip({ size: 0.1 });
      }
    };

    const draw = (now: number) => {
      const p = s.current;
      const scale = h / VIEW_H;
      const viewW = w / scale;
      p.camera +=
        (Math.max(0, Math.min(WORLD_W - viewW, p.x - viewW * 0.4)) - p.camera) *
        0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(13, 15, 12, 0.9)";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.scale(scale, scale);
      // Parallax dots.
      ctx.fillStyle = "rgba(236, 237, 230, 0.1)";
      const off = -(p.camera * 0.5) % 24;
      for (let y = 12; y < VIEW_H; y += 24)
        for (let x = off; x < viewW; x += 24) ctx.fillRect(x, y, 2, 2);

      ctx.translate(-p.camera, 0);
      ctx.font = `500 10px ${monoFont()}`;

      for (const r of PLATFORMS) {
        if (r.x > p.camera + viewW || r.x + r.w < p.camera) continue;
        ctx.fillStyle = "rgba(13, 15, 12, 0.9)";
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = SIGNAL;
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
        for (const [hx, hy] of [
          [r.x, r.y],
          [r.x + r.w, r.y],
          [r.x, r.y + r.h],
          [r.x + r.w, r.y + r.h],
        ]) {
          ctx.fillStyle = INK;
          ctx.fillRect(hx - 3, hy - 3, 6, 6);
          ctx.strokeRect(hx - 2.5, hy - 2.5, 6, 6);
        }
        ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
        ctx.fillText(`Frame · ${r.label}`, r.x + 2, r.y + r.h + 13);
      }

      for (const cp of CHECKPOINTS) {
        ctx.fillStyle = p.spawn > cp ? SIGNAL : "rgba(139, 145, 135, 0.6)";
        ctx.fillRect(cp + 6, 330, 2, 50);
        ctx.fillText("commit", cp + 12, 340);
      }

      // Goal.
      ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
      ctx.fillRect(GOAL.x, GOAL.y, GOAL.w, GOAL.h);
      ctx.strokeStyle = SIGNAL;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(GOAL.x + 0.5, GOAL.y + 0.5, GOAL.w, GOAL.h);
      ctx.setLineDash([]);
      drawLabel(ctx, "Ship it", GOAL.x + 22, GOAL.y + 30, SIGNAL);

      COINS.forEach((c, i) => {
        if (p.got.has(i)) return;
        const bob = Math.sin(now / 300 + i) * 3;
        const [name, color] = c.skill;
        ctx.fillStyle = INK;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(c.x - 5, c.y - 5 + bob, 10, 10);
        ctx.strokeRect(c.x - 5, c.y - 5 + bob, 10, 10);
        drawLabel(ctx, name, c.x - 10, c.y - 26 + bob, color);
      });

      for (const b of BUGS) {
        const bx =
          b.x1 + ((Math.sin(now / 1400 + b.x1) + 1) / 2) * (b.x2 - b.x1);
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.roundRect(bx - 9, b.y - 16, 18, 14, 6);
        ctx.fill();
        ctx.fillStyle = INK;
        ctx.fillRect(bx - 4, b.y - 12, 2, 2);
        ctx.fillRect(bx + 2, b.y - 12, 2, 2);
        ctx.fillStyle = "#FF6B6B";
        ctx.fillText("bug", bx - 9, b.y - 20);
      }

      // You: the cursor, mirrored to face where you run.
      ctx.save();
      ctx.translate(p.x + PW / 2, p.y - PH / 2);
      ctx.scale(p.facing > 0 ? -1 : 1, 1);
      drawCursor(ctx, 0, 0, SIGNAL, 1.3);
      ctx.restore();
      drawLabel(ctx, "you", p.x + PW, p.y - PH - 18, SIGNAL);
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (s.current.phase === "playing") {
        update(dt, now);
        setTime((now - s.current.started) / 1000);
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch buttons: hold to run, tap to jump.
  const hold =
    (key: "left" | "right" | "jump", down: boolean) =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (key === "jump" && down && !keys.current.jump) s.current.buffer = 0.12;
      keys.current[key] = down;
      if (down) begin(performance.now());
    };
  const pad =
    "grid h-14 place-items-center rounded-lg border border-line bg-graphite text-bone active:border-signal active:text-signal";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-fog">
        <p>
          {tr(copy.time)} <span className="text-bone">{formatTime(time)}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.stack)}{" "}
          <span className="text-bone">
            {collected}/{COINS.length}
          </span>
        </p>
        <p>
          {tr(copy.best)}{" "}
          <span className="text-signal">
            {best === null ? "—" : formatTime(best)}
          </span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.restart)}
        </p>
      </div>

      <div
        ref={wrap}
        className="relative h-[min(60vh,460px)] min-h-[300px] touch-none select-none overflow-hidden rounded-sm border border-line"
      >
        <canvas
          ref={canvas}
          className="absolute inset-0"
          role="img"
          aria-label="Frame Runner"
        />
        {phase === "ready" && (
          <p className="pointer-events-none absolute inset-x-0 top-6 text-center font-mono text-sm text-bone">
            <span className="pointer-coarse:hidden">{tr(copy.start)}</span>
            <span className="pointer-fine:hidden">{tr(copy.startTouch)}</span>
          </p>
        )}
        {phase === "won" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/60 text-center backdrop-blur-[2px]">
            <div>
              <p className="font-display text-5xl font-semibold tracking-tight">
                {tr(copy.shipped)}
              </p>
              <p className="mt-3 font-mono text-sm text-fog">
                {tr(copy.time)}{" "}
                <span className="text-bone">{formatTime(time)}</span> ·{" "}
                {tr(copy.stack)}{" "}
                <span className="text-bone">
                  {collected}/{COINS.length}
                </span>
                {newBest && (
                  <span className="ml-3 text-signal">{tr(copy.newBest)}</span>
                )}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
              >
                {tr(copy.again)}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_1fr_1.4fr] gap-2 pointer-fine:hidden">
        <button
          type="button"
          aria-label="Left"
          className={pad}
          onPointerDown={hold("left", true)}
          onPointerUp={hold("left", false)}
          onPointerLeave={hold("left", false)}
        >
          <ArrowLeft aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Right"
          className={pad}
          onPointerDown={hold("right", true)}
          onPointerUp={hold("right", false)}
          onPointerLeave={hold("right", false)}
        >
          <ArrowRight aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Jump"
          className={pad}
          onPointerDown={hold("jump", true)}
          onPointerUp={hold("jump", false)}
          onPointerLeave={hold("jump", false)}
        >
          <ArrowUp aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default PlatformGame;
