import { useEffect, useRef, useState } from "react";
import { swarmNames } from "@/data/portfolio";
import { isParty } from "@/lib/party";
import { swarm, type SwarmTask } from "@/lib/swarm";

const COLORS = [
  "#FF5CA8",
  "#4D8DFF",
  "#FFB020",
  "#A57BFF",
  "#2EC4D6",
  "#FF7A45",
  "#22C55E",
  "#F2F2EA",
];

// Only on devices with a real mouse, and only when motion is welcome.
const QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const SEPARATION = 54; // px between cursors
const MOUSE_SPACE = 46; // px kept clear around the real pointer
const MAX_SPEED = 2200; // px/s

type Agent = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  radius: number;
  tilt: number;
  jobX: number; // last task point, NaN when idle
  jobY: number;
};

// Point on the outline of a rect, t in [0, 1) walks around it clockwise.
function perimeterPoint(r: DOMRect, t: number, pad: number) {
  const w = r.width + pad * 2;
  const h = r.height + pad * 2;
  const left = r.left - pad;
  const top = r.top - pad;
  const d = (((t % 1) + 1) % 1) * 2 * (w + h);
  if (d < w) return { x: left + d, y: top };
  if (d < w + h) return { x: left + w, y: top + d - w };
  if (d < 2 * w + h) return { x: left + w - (d - w - h), y: top + h };
  return { x: left, y: top + h - (d - 2 * w - h) };
}

const SwarmCursors = () => {
  const [enabled, setEnabled] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const cursors = useRef<(HTMLDivElement | null)[]>([]);
  const arrows = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const n = swarmNames.length;
    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;

    // Start just outside the viewport, spread around it, then fly in.
    const agents: Agent[] = swarmNames.map((_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.4;
      const r = Math.hypot(vw(), vh()) / 2 + 60;
      return {
        x: vw() / 2 + Math.cos(a) * r,
        y: vh() / 2 + Math.sin(a) * r,
        vx: 0,
        vy: 0,
        phase: a,
        radius: 80 + (i % 4) * 30,
        tilt: 0,
        jobX: NaN,
        jobY: NaN,
      };
    });

    const mouse = { x: 0, y: 0, active: false, last: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      mouse.last = performance.now();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) mouse.active = false;
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      swarm.hover = target?.closest?.("[data-swarm]") ?? null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseout", onOut);
    document.addEventListener("pointerover", onOver);

    let raf = 0;
    let prev = performance.now();
    let opacity = 1;

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;
      const t = now / 1000;

      // Hand each drawing task to a cursor: keep its current one,
      // otherwise the nearest free cursor takes it.
      const jobs: ({ x: number; y: number } | null)[] = new Array(n).fill(null);
      const unassigned: [SwarmTask, { x: number; y: number }][] = [];
      for (const task of swarm.tasks) {
        const p = task.point();
        if (!p) continue;
        if (task.agent >= 0 && task.agent < n && !jobs[task.agent])
          jobs[task.agent] = p;
        else unassigned.push([task, p]);
      }
      for (const [task, p] of unassigned) {
        let best = -1;
        let bestD = Infinity;
        for (let i = 0; i < n; i++) {
          if (jobs[i]) continue;
          const d = Math.hypot(agents[i].x - p.x, agents[i].y - p.y);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        if (best < 0) break;
        task.agent = best;
        jobs[best] = p;
      }
      const focusEl = swarm.focus ?? swarm.hover;
      const rect = focusEl?.isConnected
        ? focusEl.getBoundingClientRect()
        : null;
      // 0 while the mouse moves, ramps to 1 after ~4s of stillness.
      const idle = mouse.active ? Math.min((now - mouse.last) / 4000, 1) : 1;

      const party = isParty();

      // Step back while the visitor reads: fade when the mouse rests.
      const resting =
        !party &&
        swarm.tasks.size === 0 &&
        !rect &&
        (!mouse.active || now - mouse.last > 2500);
      const target = swarm.hidden ? 0 : resting ? 0.3 : 1;
      opacity += (target - opacity) * Math.min(1, dt * 3);
      if (layer.current) layer.current.style.opacity = opacity.toFixed(3);

      for (let i = 0; i < n; i++) {
        const a = agents[i];
        const job = jobs[i];
        const isLead = job !== null;
        let tx: number;
        let ty: number;
        let k: number; // spring stiffness

        if (job) {
          tx = job.x;
          ty = job.y;
          k = 260;
        } else if (party) {
          // Party mode: a fast, pulsing ring round the middle of the screen.
          const ang = (i / n) * Math.PI * 2 + t * 2.4;
          const r =
            Math.min(vw(), vh()) * 0.3 * (1 + 0.3 * Math.sin(t * 5 + i));
          tx = vw() / 2 + Math.cos(ang) * r;
          ty = vh() / 2 + Math.sin(ang) * r;
          k = 40;
        } else if (rect) {
          const p = perimeterPoint(rect, i / n + t * 0.025, 18);
          tx = p.x;
          ty = p.y;
          k = 12;
        } else if (mouse.active) {
          const ang = a.phase + t * (0.35 + idle * 0.2);
          const r = a.radius * (1 + idle * 0.7);
          tx = mouse.x + Math.cos(ang) * r;
          ty = mouse.y + Math.sin(ang) * r * 0.75;
          k = 9;
        } else {
          const ang = a.phase + t * 0.18;
          tx = vw() / 2 + Math.cos(ang) * vw() * 0.32;
          ty = vh() / 2 + Math.sin(ang * 1.3) * vh() * 0.28;
          k = 3;
        }

        let tvx = 0;
        let tvy = 0;
        if (job) {
          if (!Number.isNaN(a.jobX)) {
            tvx = (job.x - a.jobX) / dt;
            tvy = (job.y - a.jobY) / dt;
          }
          a.jobX = job.x;
          a.jobY = job.y;
        } else {
          a.jobX = NaN;
          a.jobY = NaN;
        }

        let ax = (tx - a.x) * k;
        let ay = (ty - a.y) * k;

        if (!isLead) {
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const dx = a.x - agents[j].x;
            const dy = a.y - agents[j].y;
            const d = Math.hypot(dx, dy);
            if (d > 0.01 && d < SEPARATION) {
              const f = ((SEPARATION - d) / SEPARATION) * 1400;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }
          if (mouse.active) {
            const dx = a.x - mouse.x;
            const dy = a.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d > 0.01 && d < MOUSE_SPACE) {
              const f = ((MOUSE_SPACE - d) / MOUSE_SPACE) * 2600;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }
        }

        const snap = isLead && Math.hypot(tx - a.x, ty - a.y) < 60;
        if (snap) {
          // Close enough: hold the point exactly, like a hand dragging a handle.
          a.vx = (tx - a.x) / Math.max(dt, 1e-3);
          a.vy = (ty - a.y) / Math.max(dt, 1e-3);
        } else {
          // Slightly under-damped spring: lively, with a small overshoot.
          // Damp relative to the target's own velocity so a moving
          // corner is followed without lag.
          const damp = 1.5 * Math.sqrt(k);
          a.vx += (ax - (a.vx - tvx) * damp) * dt;
          a.vy += (ay - (a.vy - tvy) * damp) * dt;
        }
        const speed = Math.hypot(a.vx, a.vy);
        if (!isLead && speed > MAX_SPEED) {
          a.vx *= MAX_SPEED / speed;
          a.vy *= MAX_SPEED / speed;
        }
        a.x += a.vx * dt;
        a.y += a.vy * dt;

        const tiltTarget = Math.max(-22, Math.min(22, a.vx * 0.02));
        a.tilt += (tiltTarget - a.tilt) * Math.min(1, dt * 10);

        const el = cursors.current[i];
        if (el) el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
        const arrow = arrows.current[i];
        if (arrow) arrow.style.transform = `rotate(${a.tilt}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseout", onOut);
      document.removeEventListener("pointerover", onOver);
      swarm.hover = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={layer}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {swarmNames.map((name, i) => {
        const color = COLORS[i % COLORS.length];
        return (
          <div
            key={name}
            ref={(el) => {
              cursors.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ transform: "translate3d(-200px, -200px, 0)" }}
          >
            <svg
              ref={(el) => {
                arrows.current[i] = el;
              }}
              width="18"
              height="20"
              viewBox="0 0 18 20"
              className="absolute -left-0.5 -top-0.5 origin-[2px_2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
            >
              <path
                d="M2 2 L2 16.4 L6.1 12.6 L8.9 18.6 L11.7 17.3 L8.9 11.4 L14.6 11.1 Z"
                fill={color}
                stroke="#0D0F0C"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="absolute left-3.5 top-[18px] whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-medium leading-4 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
              style={{ background: color }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SwarmCursors;
