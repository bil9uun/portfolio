import { useEffect, useRef } from "react";
import type { Body, Constraint, Engine } from "matter-js";
import { SKILLS } from "@/content/skills";
import { prefersReducedMotion } from "@/lib/gsap";
import { t, useT } from "@/lib/i18n";
import { click } from "@/lib/sound";
import { tilt } from "@/lib/tilt";

// The stack I work with, as name tags (like the swarm's) that rain into a
// frame and pile up. Drag and throw them with a mouse; tap them on a phone,
// or tilt it. Physics by matter-js, loaded when the pile first shows up.

const copy = {
  label: t("Skills", "Ур чадвар"),
  hintMouse: t("Drag and throw", "Чирж шидээрэй"),
  hintTouch: t(
    "Tap a skill, tilt your phone",
    "Skill дээр дар, утсаа хазайлга",
  ),
};

const WALL = 400; // px: thick walls, so fast chips can't tunnel through

const SkillPile = () => {
  const tr = useT();
  const box = useRef<HTMLUListElement>(null);
  const chips = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    let stop = () => {};
    let cancelled = false;

    const start = async () => {
      const M = await import("matter-js");
      if (cancelled) return;
      const engine: Engine = M.Engine.create({
        gravity: { x: 0, y: 1, scale: 0.0012 },
      });
      const width = () => el.clientWidth;
      const height = () => el.clientHeight;

      const wall = { isStatic: true, friction: 0.6 };
      const floor = M.Bodies.rectangle(0, 0, 6000, WALL, wall);
      const left = M.Bodies.rectangle(0, 0, WALL, 6000, wall);
      const right = M.Bodies.rectangle(0, 0, WALL, 6000, wall);
      const placeWalls = () => {
        M.Body.setPosition(floor, { x: width() / 2, y: height() + WALL / 2 });
        M.Body.setPosition(left, { x: -WALL / 2, y: height() / 2 });
        M.Body.setPosition(right, { x: width() + WALL / 2, y: height() / 2 });
      };
      placeWalls();
      M.Composite.add(engine.world, [floor, left, right]);

      // One body per chip, sized from the DOM, dropped in a few at a time.
      const sizes = chips.current.map((c) => ({
        w: c!.offsetWidth,
        h: c!.offsetHeight,
      }));
      const bodies: Body[] = sizes.map(({ w, h }) =>
        M.Bodies.rectangle(
          w / 2 + Math.random() * Math.max(1, width() - w),
          -h - Math.random() * 160,
          w,
          h,
          {
            chamfer: { radius: h / 2 },
            restitution: 0.3,
            friction: 0.4,
            frictionAir: 0.012,
            angle: (Math.random() - 0.5) * 0.8,
          },
        ),
      );
      const timers = bodies.map((body, i) =>
        window.setTimeout(() => M.Composite.add(engine.world, body), i * 70),
      );

      // Soft clicks when chips land, at most one every 60 ms.
      let lastSound = 0;
      M.Events.on(engine, "collisionStart", ({ pairs }) => {
        const nowMs = performance.now();
        if (nowMs - lastSound < 60) return;
        const hard = pairs.some(
          (p) => Math.abs(p.bodyA.velocity.y - p.bodyB.velocity.y) > 4,
        );
        if (hard) {
          lastSound = nowMs;
          click({ pitch: 0.6 + Math.random() * 0.5, gain: 0.015 });
        }
      });

      // Mouse: grab a chip with a springy constraint and throw it.
      // Touch: a tap flicks the chip up (dragging would fight page scrolling).
      let grab: Constraint | null = null;
      const local = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const onDown = (e: PointerEvent) => {
        const p = local(e);
        const body = M.Query.point(bodies, p)[0];
        if (!body) return;
        if (e.pointerType !== "mouse") {
          M.Body.setVelocity(body, { x: (Math.random() - 0.5) * 12, y: -16 });
          M.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
          click({ pitch: 1.2, gain: 0.03 });
          return;
        }
        e.preventDefault();
        grab = M.Constraint.create({
          pointA: p,
          bodyB: body,
          pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
          stiffness: 0.2,
          damping: 0.1,
          length: 0,
        });
        M.Composite.add(engine.world, grab);
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
        click({ pitch: 1.3, gain: 0.03 });
      };
      const onMove = (e: PointerEvent) => {
        if (grab) grab.pointA = local(e);
      };
      const onUp = () => {
        if (!grab) return;
        M.Composite.remove(engine.world, grab);
        grab = null;
        el.style.cursor = "";
      };
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);

      const resize = new ResizeObserver(placeWalls);
      resize.observe(el);

      // Step the world only while the pile is on screen.
      let raf = 0;
      let prev = performance.now();
      const tick = (nowMs: number) => {
        const dt = Math.min(nowMs - prev, 1000 / 30);
        prev = nowMs;
        engine.gravity.x = tilt.active ? tilt.x * 0.8 : 0;
        M.Engine.update(engine, dt);
        bodies.forEach((body, i) => {
          const chip = chips.current[i];
          if (!chip) return;
          // Anything flung out of the frame comes back from the top.
          if (
            body.position.y > height() + 200 ||
            body.position.x < -200 ||
            body.position.x > width() + 200
          ) {
            M.Body.setPosition(body, { x: width() / 2, y: -60 });
            M.Body.setVelocity(body, { x: 0, y: 0 });
          }
          const { w, h } = sizes[i];
          chip.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
        });
        raf = requestAnimationFrame(tick);
      };
      const visible = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) {
          prev = performance.now();
          raf = requestAnimationFrame(tick);
        }
      });
      visible.observe(el);

      stop = () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        visible.disconnect();
        resize.disconnect();
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        M.Engine.clear(engine);
      };
    };

    // Start the rain when the frame is well in view.
    const trigger = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trigger.disconnect();
        void start();
      },
      { threshold: 0.4 },
    );
    trigger.observe(el);

    return () => {
      cancelled = true;
      trigger.disconnect();
      stop();
    };
  }, []);

  const still = prefersReducedMotion();

  return (
    <div>
      <div
        className={
          still
            ? "rounded-sm border border-line p-6"
            : "relative h-[340px] overflow-hidden rounded-sm border border-line bg-ink/40 md:h-[420px]"
        }
      >
        {/* Dotted canvas behind the chips (its fade mask must not touch them) */}
        {!still && <div aria-hidden className="canvas-grid absolute inset-0" />}
        <ul
          ref={box}
          aria-label={tr(copy.label)}
          className={
            still
              ? "flex flex-wrap gap-2"
              : "absolute inset-0 cursor-grab touch-pan-y select-none"
          }
        >
          {SKILLS.map(([name, color], i) => (
            <li
              key={name}
              ref={(node) => {
                chips.current[i] = node;
              }}
              className={
                still
                  ? "rounded-full px-3 py-1.5 font-mono text-[13px] font-medium text-ink"
                  : "absolute left-0 top-0 whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-[13px] md:text-sm font-medium text-ink shadow-[0_4px_12px_rgba(0,0,0,0.35)] will-change-transform"
              }
              style={{
                background: color,
                transform: still ? undefined : "translate(-9999px, 0)",
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      {!still && (
        <p className="mt-3 text-right font-mono text-[11px] text-fog">
          <span className="pointer-coarse:hidden">{tr(copy.hintMouse)}</span>
          <span className="pointer-fine:hidden">{tr(copy.hintTouch)}</span>
        </p>
      )}
    </div>
  );
};

export default SkillPile;
