import { useRef, type HTMLAttributes, type Ref } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { addFrameDraw } from "@/lib/swarm";
import { cn } from "@/lib/utils";

const HANDLES = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-left-1 -bottom-1",
  "-right-1 -bottom-1",
];

type FrameProps = {
  label: string;
  className?: string;
  frameRef: Ref<HTMLDivElement>;
  boxRef: Ref<HTMLDivElement>;
  badgeRef: Ref<HTMLSpanElement>;
};

// Figma-style selection: outline, corner handles, layer name and a size badge.
export const SelectionFrame = ({
  label,
  className,
  frameRef,
  boxRef,
  badgeRef,
}: FrameProps) => (
  <div
    ref={frameRef}
    aria-hidden
    style={{ visibility: "hidden" }}
    className={cn("pointer-events-none absolute z-10", className)}
  >
    <div
      ref={boxRef}
      className="absolute left-0 top-0 size-full border border-signal"
    >
      {HANDLES.map((pos) => (
        <span
          key={pos}
          className={cn("absolute size-2 border border-signal bg-ink", pos)}
        />
      ))}
      <span className="absolute -top-5 left-0 whitespace-nowrap font-mono text-[10px] text-signal">
        {label}
      </span>
    </div>
    <span
      ref={badgeRef}
      className="absolute left-0 top-0 whitespace-nowrap rounded-sm bg-signal px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink"
    />
  </div>
);

type BuildProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  delay?: number;
  frameClassName?: string;
  /** Draw on page load instead of on scroll, e.g. for the fixed header. */
  immediate?: boolean;
  /** ScrollTrigger start position. */
  start?: string;
};

// Wraps a piece of the page so a swarm cursor "draws" it into existence
// the first time it scrolls into view (or on load when `immediate`).
const Build = ({
  label,
  delay = 0,
  className,
  frameClassName = "-inset-2",
  immediate = false,
  start = "top 90%",
  children,
  ...rest
}: BuildProps) => {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      let release: (() => void) | undefined;

      gsap.set(content.current, { autoAlpha: 0, y: 16 });
      const onScreen = () => {
        const r = root.current!.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      };

      // Calls `done` once this element has stopped moving on screen
      // (the smoothed scroll has settled), or after a second at most.
      let timer = 0;
      const waitForRest = (done: () => void) => {
        let last = root.current!.getBoundingClientRect().top;
        let still = 0;
        let tries = 0;
        const check = () => {
          const top = root.current?.getBoundingClientRect().top ?? last;
          still = Math.abs(top - last) < 1 ? still + 1 : 0;
          last = top;
          if (still >= 3 || ++tries > 16) done();
          else timer = window.setTimeout(check, 60);
        };
        timer = window.setTimeout(check, 60);
      };

      // Show the content at once, without a frame, cursor or sound.
      const show = contextSafe!(() => {
        gsap.to(content.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          overwrite: true,
        });
      });

      const run = contextSafe!(() => {
        const tl = gsap.timeline({ delay });
        release = addFrameDraw(
          tl,
          { frame: frame.current!, box: box.current!, badge: badge.current! },
          0.25,
          0.45,
        );
        tl.to(
          content.current,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
          0.55,
        );
      });

      if (immediate) run();
      else {
        // Build once. Don't use `once: true`: a trigger that is already past
        // when created (e.g. after a replay) would kill itself in the middle
        // of ScrollTrigger's refresh and crash it. Kill it a frame later.
        let built = false;
        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start,
          onEnter: (self) => {
            if (built) return;
            built = true;
            requestAnimationFrame(() => trigger.kill());
            if (Math.abs(self.getVelocity()) < 1500 && onScreen()) return run();
            // Moving fast (a flick of the wheel, a jump from the nav): wait for
            // the page to come to rest, then draw only what is on screen and
            // simply show the rest. Drawing everything we fly past would be a
            // frantic blur of cursors and sound.
            waitForRest(() => (onScreen() ? run() : show()));
          },
        });
      }

      return () => {
        clearTimeout(timer);
        release?.();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative", className)} {...rest}>
      <SelectionFrame
        label={label}
        className={frameClassName}
        frameRef={frame}
        boxRef={box}
        badgeRef={badge}
      />
      <div ref={content}>{children}</div>
    </div>
  );
};

export default Build;
