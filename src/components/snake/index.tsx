import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { ScrollSmoother } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { isTyping, readSetting, writeSetting } from "@/lib/store";
import { swarm } from "@/lib/swarm";

// Cursor Snake: the snake is a conga line of cursors on the dotted canvas.
// Each skill you eat joins the tail as a cursor in its own colour.

const copy = {
  start: t(
    "Press an arrow key or swipe to start",
    "Эхлэхийн тулд сум дарах эсвэл swipe хийнэ үү",
  ),
  paused: t(
    "Paused · press Space to resume",
    "Түр зогссон · үргэлжлүүлэх бол Space",
  ),
  over: t("Game over", "Тоглоом дууслаа"),
  restart: t("Play again", "Дахин тоглох"),
  score: t("Score", "Оноо"),
  best: t("Best", "Шилдэг"),
  stack: t("Your stack", "Цуглуулсан stack"),
  emptyStack: t(
    "Eat a skill to start your stack.",
    "Skill идэж stack-аа цуглуулаарай.",
  ),
  you: t("you", "чи"),
  keys: t(
    "Arrows / WASD to move · Space to pause · R to restart · F fullscreen",
    "Сум / WASD хөдлөх · Space зогсоох · R дахин эхлэх · F бүтэн дэлгэц",
  ),
  fullscreen: t("Fullscreen", "Бүтэн дэлгэц"),
  exitFullscreen: t("Exit fullscreen", "Бүтэн дэлгэцээс гарах"),
};

// Tools from my projects (NTV, APU OnTap, GS25, Shunkhlai, SG.MN, Takhi).
const SKILLS = [
  ["React", "#61DAFB"],
  ["Next.js", "#F2F2EA"],
  ["TypeScript", "#4D8DFF"],
  ["JavaScript", "#F7DF1E"],
  ["Tailwind", "#38BDF8"],
  ["TanStack Query", "#FF6B6B"],
  ["TanStack Router", "#2EC4D6"],
  ["Zustand", "#FFB020"],
  ["Jotai", "#E2E8F0"],
  ["Redux", "#A57BFF"],
  ["Node.js", "#7BD88F"],
  ["SQL", "#FFB86C"],
  ["Vite", "#BD93F9"],
  ["Turborepo", "#FF5CA8"],
  ["GSAP", "#A3E635"],
  ["Framer Motion", "#F472B6"],
  ["Mantine", "#5C9DFF"],
  ["MUI", "#64B5F6"],
  ["Ant Design", "#FF7A7A"],
  ["shadcn/ui", "#D4D4D8"],
  ["React Hook Form", "#EC5990"],
  ["Zod", "#6E9BF0"],
  ["Axios", "#A78BFA"],
  ["next-intl", "#34D399"],
  ["i18next", "#4FD1C5"],
  ["Tiptap", "#FDBA74"],
  ["Video.js", "#FF7A45"],
  ["Recharts", "#22D3EE"],
  ["Leaflet", "#86EFAC"],
  ["Firebase", "#FFCA28"],
] as const;

type Point = { x: number; y: number };
type Segment = Point & { color: string };
type Phase = "ready" | "playing" | "paused" | "over";

const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

const HEAD = "#22C55E";
const INK = "#0d0f0c";
// The swarm's cursor shape, drawn in an 18 × 20 box with the tip at (2, 2).
const ARROW = new Path2D(
  "M2 2 L2 16.4 L6.1 12.6 L8.9 18.6 L11.7 17.3 L8.9 11.4 L14.6 11.1 Z",
);
// The tip points up-left; rotate by this much less to face a direction.
const ARROW_BASE = Math.atan2(-1, -1);

const tickFor = (score: number) => Math.max(65, 135 - score * 4);

const Snake = () => {
  const tr = useT();
  const area = useRef<HTMLDivElement>(null); // space the board may fill
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(
    () => Number(readSetting("snake-best")) || 0,
  );
  const [stack, setStack] = useState<string[]>([]);
  const [dims, setDims] = useState({ cols: 28, rows: 18 });
  const [full, setFull] = useState(false);
  const game = useRef({
    cols: 28,
    rows: 18,
    cell: 24,
    snake: [] as Segment[],
    prev: [] as Point[],
    dir: { x: 1, y: 0 },
    queue: [] as Point[],
    food: { x: 0, y: 0, skill: 0 },
    eaten: 0,
    acc: 0,
    phase: "ready" as Phase,
  });

  const setGamePhase = (next: Phase) => {
    game.current.phase = next;
    setPhase(next);
    // The site's swarm stays out of the way until the game ends.
    swarm.hidden = next !== "over";
  };

  useEffect(
    () => () => {
      swarm.hidden = false;
    },
    [],
  );

  const placeFood = () => {
    const g = game.current;
    const taken = new Set(g.snake.map((s) => `${s.x},${s.y}`));
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * g.cols);
      y = Math.floor(Math.random() * g.rows);
    } while (taken.has(`${x},${y}`));
    g.food = { x, y, skill: g.eaten % SKILLS.length };
  };

  const reset = () => {
    const g = game.current;
    const y = Math.floor(g.rows / 2);
    const x = Math.floor(g.cols / 4);
    g.snake = [0, 1, 2].map((i) => ({ x: x - i, y, color: HEAD }));
    g.prev = g.snake.map(({ x, y }) => ({ x, y }));
    g.dir = { x: 1, y: 0 };
    g.queue = [];
    g.eaten = 0;
    g.acc = 0;
    placeFood();
    setScore(0);
    setStack([]);
    setGamePhase("ready");
  };

  const turn = (dir: Point) => {
    const g = game.current;
    if (g.phase === "over") return;
    if (g.phase === "ready" || g.phase === "paused") setGamePhase("playing");
    // Buffer up to two turns; ignore reversing onto yourself.
    const last = g.queue[g.queue.length - 1] ?? g.dir;
    if (dir.x === -last.x && dir.y === -last.y) return;
    if (dir.x === last.x && dir.y === last.y) return;
    if (g.queue.length < 2) g.queue.push(dir);
  };

  const step = () => {
    const g = game.current;
    if (g.queue.length) g.dir = g.queue.shift()!;
    const head = g.snake[0];
    const next = { x: head.x + g.dir.x, y: head.y + g.dir.y };
    const grows = next.x === g.food.x && next.y === g.food.y;
    const body = grows ? g.snake : g.snake.slice(0, -1);
    const hitWall =
      next.x < 0 || next.y < 0 || next.x >= g.cols || next.y >= g.rows;
    const hitSelf = body.some((s) => s.x === next.x && s.y === next.y);

    if (hitWall || hitSelf) {
      setGamePhase("over");
      blip({ size: 1, gain: 0.05 });
      // The swarm comes over to look at the wreck.
      swarm.focus = board.current;
      setTimeout(() => {
        if (swarm.focus === board.current) swarm.focus = null;
      }, 2200);
      const final = g.eaten;
      setBest((b) => {
        const nextBest = Math.max(b, final);
        writeSetting("snake-best", String(nextBest));
        return nextBest;
      });
      return;
    }

    g.prev = g.snake.map(({ x, y }) => ({ x, y }));
    if (grows) {
      const [name, color] = SKILLS[g.food.skill];
      // Colours shift down the line, so the newest skill joins right behind the head.
      g.snake = [
        { ...next, color: HEAD },
        ...g.snake.map((s, i) => (i === 0 ? { ...s, color } : s)),
      ];
      g.prev.push(g.prev[g.prev.length - 1]);
      g.eaten += 1;
      setScore(g.eaten);
      setStack((s) => [...s, name]);
      click({ pitch: 1.2, gain: 0.06 });
      blip({ size: 0.15 });
      placeFood();
    } else {
      g.snake = [
        { ...next, color: HEAD },
        ...g.snake
          .slice(0, -1)
          .map((s, i) => ({ ...s, color: g.snake[i + 1].color })),
      ];
    }
  };

  // Size the board to the space it has. Re-runs when fullscreen swaps the
  // canvas, and only restarts the game if the grid itself changes.
  useEffect(() => {
    const fit = () => {
      const el = area.current;
      const cv = canvas.current;
      if (!el || !cv) return;
      const g = game.current;
      const narrow = el.clientWidth < 640;
      const cols = narrow ? 16 : 28;
      const rows = narrow ? 20 : 18;
      const changed = cols !== g.cols || rows !== g.rows || !g.snake.length;
      g.cols = cols;
      g.rows = rows;
      // Leave room for the frame's label and size badge.
      const maxH = full ? el.clientHeight - 48 : Infinity;
      g.cell = Math.max(
        8,
        Math.floor(Math.min((el.clientWidth - 16) / cols, maxH / rows)),
      );
      setDims({ cols, rows });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cols * g.cell * dpr;
      cv.height = rows * g.cell * dpr;
      cv.style.width = `${cols * g.cell}px`;
      cv.style.height = `${rows * g.cell}px`;
      cv.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (changed) reset();
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (area.current) observer.observe(area.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  // Fullscreen: the real Fullscreen API where it exists, otherwise (iPhone)
  // a fixed overlay. Either way the stage is portalled to <body>, because
  // the smooth-scrolled page is transformed and would trap a fixed element.
  useEffect(() => {
    if (!full) return;
    const stage = area.current?.closest<HTMLElement>("[data-snake-stage]");
    if (stage?.requestFullscreen && !document.fullscreenElement)
      stage.requestFullscreen().catch(() => {});
    ScrollSmoother.get()?.paused(true);
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      ScrollSmoother.get()?.paused(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [full]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.code === "KeyF") {
        setFull((f) => !f);
        return;
      }
      if (e.code === "Escape") setFull(false);
      const dir = DIRS[e.code];
      if (dir) {
        e.preventDefault();
        turn(dir);
      } else if (e.code === "Space") {
        e.preventDefault();
        const p = game.current.phase;
        if (p === "playing") setGamePhase("paused");
        else if (p === "paused") setGamePhase("playing");
      } else if (
        e.code === "KeyR" ||
        (e.code === "Enter" && game.current.phase === "over")
      ) {
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loop: fixed-step game ticks, drawn every frame with smooth in-between motion.
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const font =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--font-mono",
      ) || "monospace";
    let raf = 0;
    let last = performance.now();

    const label = (
      text: string,
      x: number,
      y: number,
      color: string,
      w: number,
    ) => {
      ctx.font = `500 11px ${font}`;
      const tw = ctx.measureText(text).width + 12;
      const lx = Math.max(2, Math.min(x, w - tw - 2));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(lx, y, tw, 17, 8.5);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.fillText(text, lx + 6, y + 12.5);
    };

    const arrow = (
      cx: number,
      cy: number,
      dir: Point,
      color: string,
      scale: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.atan2(dir.y, dir.x) - ARROW_BASE);
      ctx.scale(scale, scale);
      ctx.translate(-8, -10);
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.fill(ARROW);
      ctx.stroke(ARROW);
      ctx.restore();
    };

    const draw = (now: number) => {
      const g = game.current;
      const { cell, cols, rows } = g;
      const w = cols * cell;
      const h = rows * cell;
      const k =
        g.phase === "playing" ? Math.min(g.acc / tickFor(g.eaten), 1) : 1;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(13, 15, 12, 0.88)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(236, 237, 230, 0.13)";
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          ctx.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);

      // Food: a selection handle with its skill's name, pulsing.
      const [name, color] = SKILLS[g.food.skill];
      const fx = g.food.x * cell + cell / 2;
      const fy = g.food.y * cell + cell / 2;
      const pulse = 1 + Math.sin(now / 180) * 0.12;
      const s = cell * 0.36 * pulse;
      ctx.fillStyle = INK;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fillRect(fx - s / 2, fy - s / 2, s, s);
      ctx.strokeRect(fx - s / 2, fy - s / 2, s, s);
      label(
        name,
        fx - 6,
        g.food.y < 1 ? fy + cell * 0.5 : fy - cell * 0.5 - 17,
        color,
        w,
      );

      // Snake, tail first so the head draws on top.
      for (let i = g.snake.length - 1; i >= 0; i--) {
        const seg = g.snake[i];
        const from = g.prev[i] ?? seg;
        const x = (from.x + (seg.x - from.x) * k) * cell + cell / 2;
        const y = (from.y + (seg.y - from.y) * k) * cell + cell / 2;
        const ahead =
          i === 0 ? { x: seg.x + g.dir.x, y: seg.y + g.dir.y } : g.snake[i - 1];
        const dir = { x: ahead.x - seg.x, y: ahead.y - seg.y };
        arrow(
          x,
          y,
          dir.x || dir.y ? dir : g.dir,
          seg.color,
          (cell / 22) * (i === 0 ? 1.25 : 0.95),
        );
        if (i === 0)
          label(tr(copy.you), x + cell * 0.3, y + cell * 0.35, HEAD, w);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const g = game.current;
      if (g.phase === "playing") {
        g.acc += dt;
        const tick = tickFor(g.eaten);
        while (g.acc >= tick && g.phase === "playing") {
          g.acc -= tick;
          step();
        }
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tr, full]);

  // Swipe on touch screens.
  const swipe = useRef<Point | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse")
      swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    turn(
      Math.abs(dx) > Math.abs(dy)
        ? { x: Math.sign(dx), y: 0 }
        : { x: 0, y: Math.sign(dy) },
    );
  };

  const pad =
    "grid size-14 place-items-center rounded-lg border border-line bg-graphite text-bone active:border-signal active:text-signal";

  const toggle = (
    <button
      type="button"
      onClick={() => setFull((f) => !f)}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-fog transition-colors hover:border-signal hover:text-bone"
    >
      {full ? (
        <Minimize2 aria-hidden className="size-3.5" />
      ) : (
        <Maximize2 aria-hidden className="size-3.5" />
      )}
      {tr(full ? copy.exitFullscreen : copy.fullscreen)}
    </button>
  );

  const stage = (
    <div
      data-snake-stage
      className={cn(
        full
          ? "fixed inset-0 z-[80] flex flex-col gap-4 bg-ink p-4 md:p-8"
          : "grid gap-10 lg:grid-cols-[1fr_16rem]",
      )}
    >
      <div className={cn(full && "flex min-h-0 flex-1 flex-col")}>
        <div className="mb-8 flex items-center justify-between gap-4 font-mono text-xs text-fog">
          {full ? (
            <p>
              {tr(copy.score)} <span className="text-bone">{score}</span> ·{" "}
              {tr(copy.best)} <span className="text-signal">{best}</span>
            </p>
          ) : (
            <span />
          )}
          {toggle}
        </div>
        <div
          ref={area}
          className={cn(full && "grid min-h-0 flex-1 place-items-center")}
        >
          <div className="relative mx-auto w-fit">
            {/* Static selection frame around the board */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-2 border border-signal"
            >
              {[
                "-left-1 -top-1",
                "-right-1 -top-1",
                "-left-1 -bottom-1",
                "-right-1 -bottom-1",
              ].map((pos) => (
                <span
                  key={pos}
                  className={`absolute size-2 border border-signal bg-ink ${pos}`}
                />
              ))}
              <span className="absolute -top-5 left-0 font-mono text-[10px] text-signal">
                Frame · snake
              </span>
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-sm bg-signal px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
                {dims.cols} × {dims.rows}
              </span>
            </div>

            <div
              ref={board}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              className="relative touch-none select-none"
            >
              <canvas
                ref={canvas}
                role="img"
                aria-label="Cursor Snake"
                className="block"
              />

              {phase !== "playing" && (
                <div className="absolute inset-0 grid place-items-center bg-ink/55 p-6 text-center backdrop-blur-[2px]">
                  <div>
                    {phase === "over" && (
                      <>
                        <p className="font-display text-5xl font-semibold tracking-tight">
                          {tr(copy.over)}
                        </p>
                        <p className="mt-3 font-mono text-sm text-fog">
                          {tr(copy.score)}{" "}
                          <span className="text-bone">{score}</span> ·{" "}
                          {tr(copy.best)}{" "}
                          <span className="text-signal">{best}</span>
                        </p>
                        <button
                          type="button"
                          onClick={reset}
                          className="mt-6 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
                        >
                          {tr(copy.restart)}
                        </button>
                      </>
                    )}
                    {phase === "ready" && (
                      <p className="font-mono text-sm text-bone">
                        {tr(copy.start)}
                      </p>
                    )}
                    {phase === "paused" && (
                      <p className="font-mono text-sm text-bone">
                        {tr(copy.paused)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p
          className={cn(
            "mt-12 font-mono text-xs text-fog pointer-coarse:hidden",
            full && "mt-8 text-center",
          )}
        >
          {tr(copy.keys)}
        </p>

        {/* D-pad for touch screens */}
        <div
          className={cn(
            "mx-auto mt-12 grid w-fit grid-cols-3 gap-2 pointer-fine:hidden",
            full && "mt-6",
          )}
        >
          <span />
          <button
            type="button"
            aria-label="Up"
            className={pad}
            onClick={() => turn({ x: 0, y: -1 })}
          >
            <ArrowUp aria-hidden />
          </button>
          <span />
          <button
            type="button"
            aria-label="Left"
            className={pad}
            onClick={() => turn({ x: -1, y: 0 })}
          >
            <ArrowLeft aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Down"
            className={pad}
            onClick={() => turn({ x: 0, y: 1 })}
          >
            <ArrowDown aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Right"
            className={pad}
            onClick={() => turn({ x: 1, y: 0 })}
          >
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <aside className={cn("font-mono text-xs text-fog", full && "hidden")}>
        <dl className="grid grid-cols-2 gap-4 border-y border-line py-5">
          <div>
            <dt className="uppercase tracking-[0.18em]">{tr(copy.score)}</dt>
            <dd
              aria-live="polite"
              className="mt-2 font-display text-4xl font-semibold text-bone"
            >
              {score}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.18em]">{tr(copy.best)}</dt>
            <dd className="mt-2 font-display text-4xl font-semibold text-signal">
              {best}
            </dd>
          </div>
        </dl>
        <p className="mt-6 uppercase tracking-[0.18em]">{tr(copy.stack)}</p>
        {stack.length === 0 ? (
          <p className="mt-3 leading-relaxed">{tr(copy.emptyStack)}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {stack.map((name, i) => {
              const color = SKILLS.find(([n]) => n === name)?.[1] ?? HEAD;
              return (
                <li
                  key={i}
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium text-ink"
                  style={{ background: color }}
                >
                  {name}
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );

  return full ? createPortal(stage, document.body) : stage;
};

export default Snake;
