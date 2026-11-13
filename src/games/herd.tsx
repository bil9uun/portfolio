import { useEffect, useRef, useState } from "react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { SKILLS } from "@/content/skills";
import { drawCursor, drawLabel, fitCanvas, INK, SIGNAL } from "@/games/canvas";
import { formatTime, useBest, useHideSwarm } from "@/games/use-best";
import { swarm } from "@/lib/swarm";
import { cn } from "@/lib/utils";
import { pillButton } from "@/components/ui/styles";

// Cursor Herding: the cursors flee your pointer. Push them into the frame;
// once inside, a cursor stays penned.

const copy = {
  start: t(
    "Move your pointer near the cursors to start",
    "Эхлэхийн тулд заагчаа cursor-уудын ойролцоо аваачаарай",
  ),
  won: t("All herded", "Бүгдийг хөөж орууллаа"),
  time: t("Time", "Хугацаа"),
  best: t("Best", "Шилдэг"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
  again: t("Play again", "Дахин тоглох"),
  penned: t("penned", "хашигдсан"),
};

const FLEE_RADIUS = 130;
const MAX_SPEED = 520;

type Herded = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  name: string;
  color: string;
  penned: boolean;
};

type Phase = "ready" | "playing" | "won";

type Props = {
  /** Small inline version for the home page: fewer cursors, no saved best. */
  compact?: boolean;
};

const HerdGame = ({ compact = false }: Props) => {
  const count = compact ? 6 : 10;
  const tr = useT();
  // Full page: hide the site's swarm. Inline: only while the pointer is on the board.
  useHideSwarm(!compact);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [penned, setPenned] = useState(0);
  const [time, setTime] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [best, submit] = useBest("herd", "lower");
  const state = useRef({
    w: 800,
    h: 480,
    pen: { x: 0, y: 0, w: 0, h: 0 },
    cursors: [] as Herded[],
    pointer: { x: -999, y: -999, active: false },
    started: 0,
    phase: "ready" as Phase,
  });

  const reset = () => {
    const s = state.current;
    const pw = Math.max(150, s.w * 0.26);
    const ph = Math.max(130, s.h * 0.34);
    s.pen = { x: s.w - pw - s.w * 0.08, y: (s.h - ph) / 2, w: pw, h: ph };
    const picks = [...SKILLS].sort(() => Math.random() - 0.5).slice(0, count);
    s.cursors = picks.map(([name, color]) => ({
      x: 40 + Math.random() * (s.w * 0.45),
      y: 40 + Math.random() * (s.h - 80),
      vx: 0,
      vy: 0,
      heading: Math.random() * Math.PI * 2,
      name,
      color,
      penned: false,
    }));
    s.phase = "ready";
    s.started = 0;
    setPhase("ready");
    setPenned(0);
    setTime(0);
    setNewBest(false);
  };

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let ctx = fitCanvas(cv, el.clientWidth, el.clientHeight);
    const s = state.current;
    s.w = el.clientWidth;
    s.h = el.clientHeight;
    reset();

    const observer = new ResizeObserver(() => {
      s.w = el.clientWidth;
      s.h = el.clientHeight;
      ctx = fitCanvas(cv, s.w, s.h);
      reset();
    });
    observer.observe(el);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { pen, pointer } = s;

      if (s.phase === "playing") setTime((now - s.started) / 1000);

      for (const c of s.cursors) {
        // Wander: a slowly drifting heading.
        c.heading += (Math.random() - 0.5) * 4 * dt;
        let ax = Math.cos(c.heading) * 90;
        let ay = Math.sin(c.heading) * 90;

        // Flee the pointer.
        if (pointer.active) {
          const dx = c.x - pointer.x;
          const dy = c.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < FLEE_RADIUS && d > 0.01) {
            const push = (1 - d / FLEE_RADIUS) * 2600;
            ax += (dx / d) * push;
            ay += (dy / d) * push;
            if (s.phase === "ready") {
              s.phase = "playing";
              s.started = now;
              setPhase("playing");
            }
          }
        }

        c.vx = (c.vx + ax * dt) * Math.exp(-dt * 2.2);
        c.vy = (c.vy + ay * dt) * Math.exp(-dt * 2.2);
        const speed = Math.hypot(c.vx, c.vy);
        if (speed > MAX_SPEED) {
          c.vx *= MAX_SPEED / speed;
          c.vy *= MAX_SPEED / speed;
        }
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        // Bounce off the walls, or off the pen once inside it.
        const box = c.penned
          ? {
              l: pen.x + 10,
              t: pen.y + 12,
              r: pen.x + pen.w - 10,
              b: pen.y + pen.h - 12,
            }
          : { l: 10, t: 12, r: s.w - 10, b: s.h - 12 };
        if (c.x < box.l) {
          c.x = box.l;
          c.vx = Math.abs(c.vx);
          c.heading = 0;
        }
        if (c.x > box.r) {
          c.x = box.r;
          c.vx = -Math.abs(c.vx);
          c.heading = Math.PI;
        }
        if (c.y < box.t) {
          c.y = box.t;
          c.vy = Math.abs(c.vy);
          c.heading = Math.PI / 2;
        }
        if (c.y > box.b) {
          c.y = box.b;
          c.vy = -Math.abs(c.vy);
          c.heading = -Math.PI / 2;
        }

        if (
          !c.penned &&
          s.phase === "playing" &&
          c.x > pen.x + 10 &&
          c.x < pen.x + pen.w - 10 &&
          c.y > pen.y + 12 &&
          c.y < pen.y + pen.h - 12
        ) {
          c.penned = true;
          const count = s.cursors.filter((x) => x.penned).length;
          setPenned(count);
          click({ pitch: 1 + count * 0.05 });
          if (count === s.cursors.length) {
            s.phase = "won";
            const total = (now - s.started) / 1000;
            setTime(total);
            setPhase("won");
            if (!compact) setNewBest(submit(Math.round(total * 10) / 10));
            blip({ size: 0.1 });
          }
        }
      }

      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const draw = (now: number) => {
      const { w, h, pen, pointer } = s;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(13, 15, 12, 0.88)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(236, 237, 230, 0.12)";
      for (let y = 12; y < h; y += 24)
        for (let x = 12; x < w; x += 24) ctx.fillRect(x - 1, y - 1, 2, 2);

      // The pen: a selection frame with handles and a count badge.
      ctx.fillStyle = "rgba(34, 197, 94, 0.06)";
      ctx.fillRect(pen.x, pen.y, pen.w, pen.h);
      ctx.strokeStyle = SIGNAL;
      ctx.lineWidth = 1;
      ctx.strokeRect(pen.x + 0.5, pen.y + 0.5, pen.w, pen.h);
      for (const [hx, hy] of [
        [pen.x, pen.y],
        [pen.x + pen.w, pen.y],
        [pen.x, pen.y + pen.h],
        [pen.x + pen.w, pen.y + pen.h],
      ]) {
        ctx.fillStyle = INK;
        ctx.fillRect(hx - 4, hy - 4, 8, 8);
        ctx.strokeRect(hx - 3.5, hy - 3.5, 8, 8);
      }
      const count = s.cursors.filter((c) => c.penned).length;
      drawLabel(
        ctx,
        `Frame · pen  ${count}/${s.cursors.length}`,
        pen.x,
        pen.y - 24,
        SIGNAL,
        w,
      );

      // Your reach.
      if (pointer.active) {
        const pulse = 1 + Math.sin(now / 200) * 0.03;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, FLEE_RADIUS * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
        ctx.fill();
        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.stroke();
      }

      for (const c of s.cursors) {
        ctx.globalAlpha = c.penned ? 0.55 : 1;
        drawCursor(ctx, c.x, c.y, c.color, 1.1);
        drawLabel(ctx, c.name, c.x + 4, c.y + 10, c.color, w);
        ctx.globalAlpha = 1;
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    state.current.pointer = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };
  const leave = () => (state.current.pointer.active = false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between font-mono text-xs text-fog">
        <p>
          {tr(copy.time)} <span className="text-bone">{formatTime(time)}</span>
          <span className="mx-2 text-line">|</span>
          {penned}/{count} {tr(copy.penned)}
        </p>
        <p className={cn(compact && "hidden")}>
          {tr(copy.best)}{" "}
          <span className="text-signal">
            {best === null ? "—" : formatTime(best)}
          </span>
        </p>
      </div>
      <div
        ref={wrap}
        onPointerMove={move}
        onPointerDown={move}
        onPointerEnter={() => compact && (swarm.hidden = true)}
        onPointerLeave={() => {
          leave();
          if (compact) swarm.hidden = false;
        }}
        onPointerCancel={leave}
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-sm border border-line",
          compact ? "h-[360px]" : "h-[min(65vh,540px)] min-h-[360px]",
        )}
      >
        <canvas
          ref={canvas}
          className="absolute inset-0"
          role="img"
          aria-label="Cursor Herding"
        />
        {phase === "ready" && (
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-sm text-bone">
            {tr(copy.start)}
          </p>
        )}
        {phase === "won" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/60 text-center backdrop-blur-[2px]">
            <div>
              <p className="font-display text-5xl font-semibold tracking-tight">
                {tr(copy.won)}
              </p>
              <p className="mt-3 font-mono text-sm text-fog">
                {tr(copy.time)}{" "}
                <span className="text-bone">{formatTime(time)}</span>
                {newBest && (
                  <span className="ml-3 text-signal">{tr(copy.newBest)}</span>
                )}
              </p>
              <button
                type="button"
                onClick={reset}
                className={cn(pillButton, "mt-6")}
              >
                {tr(copy.again)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HerdGame;
