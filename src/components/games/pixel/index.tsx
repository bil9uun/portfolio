import { useEffect, useRef, useState } from "react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { useBest, useHideSwarm } from "@/components/games/use-best";
import { cn } from "@/lib/utils";

// Pixel Perfect: drag out a selection frame of an exact size, by eye.

const copy = {
  draw: t("Draw a frame of", "Ийм хэмжээтэй frame зур:"),
  round: t("Round", "Тойрог"),
  score: t("Score", "Оноо"),
  best: t("Best", "Шилдэг"),
  hint: t("Press and drag on the canvas", "Canvas дээр дарж чирээрэй"),
  off: t("Off by", "Зөрүү"),
  perfect: t("Pixel perfect!", "Яг таг!"),
  next: t("Next round", "Дараагийн тойрог"),
  done: t("Final score", "Эцсийн оноо"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
  again: t("Play again", "Дахин тоглох"),
};

const ROUNDS = 5;
type Box = { x: number; y: number; w: number; h: number };
type Result = {
  box: Box;
  target: { w: number; h: number };
  error: number;
  points: number;
};

const randomTarget = (maxW: number, maxH: number) => ({
  w: Math.round(60 + Math.random() * Math.max(40, maxW * 0.7 - 60)),
  h: Math.round(40 + Math.random() * Math.max(30, maxH * 0.7 - 40)),
});

const HANDLES = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-left-1 -bottom-1",
  "-right-1 -bottom-1",
];

const Frame = ({
  box,
  className,
  label,
}: {
  box: Box;
  className?: string;
  label?: string;
}) => (
  <div
    className={cn("pointer-events-none absolute border", className)}
    style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
  >
    {HANDLES.map((pos) => (
      <span
        key={pos}
        className={cn("absolute size-2 border border-current bg-ink", pos)}
      />
    ))}
    {label && (
      <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-signal px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink">
        {label}
      </span>
    )}
  </div>
);

const PixelGame = () => {
  const tr = useT();
  useHideSwarm();
  const board = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState({ w: 240, h: 135 });
  const [drag, setDrag] = useState<{ x0: number; y0: number; box: Box } | null>(
    null,
  );
  const [results, setResults] = useState<Result[]>([]);
  const [newBest, setNewBest] = useState(false);
  const [best, submit] = useBest("pixel", "higher");
  const result = results[round - 1];
  const finished = results.length === ROUNDS && !!result && round === ROUNDS;
  const total = results.reduce((sum, r) => sum + r.points, 0);

  const local = (e: React.PointerEvent) => {
    const rect = board.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
    };
  };

  const down = (e: React.PointerEvent) => {
    if (result) return; // round already scored
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    setDrag({ x0: p.x, y0: p.y, box: { x: p.x, y: p.y, w: 0, h: 0 } });
    click({ gain: 0.04 });
  };

  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = local(e);
    setDrag({
      ...drag,
      box: {
        x: Math.min(drag.x0, p.x),
        y: Math.min(drag.y0, p.y),
        w: Math.abs(p.x - drag.x0),
        h: Math.abs(p.y - drag.y0),
      },
    });
  };

  const up = () => {
    if (!drag) return;
    const box = {
      ...drag.box,
      w: Math.round(drag.box.w),
      h: Math.round(drag.box.h),
    };
    setDrag(null);
    if (box.w < 6 && box.h < 6) return; // a stray tap, not an attempt
    const error = Math.abs(box.w - target.w) + Math.abs(box.h - target.h);
    const points = Math.max(0, 100 - error);
    const next = [...results, { box, target, error, points }];
    setResults(next);
    blip({ size: 1 - points / 100 });
    if (next.length === ROUNDS)
      setNewBest(submit(next.reduce((s, r) => s + r.points, 0)));
  };

  const nextRound = () => {
    const rect = board.current!.getBoundingClientRect();
    setRound((r) => r + 1);
    setTarget(randomTarget(rect.width, rect.height));
  };

  const restart = () => {
    const rect = board.current!.getBoundingClientRect();
    setResults([]);
    setRound(1);
    setNewBest(false);
    setTarget(randomTarget(rect.width, rect.height));
  };

  // Start with a random size that fits this board.
  useEffect(() => {
    restart();
     
  }, []);

  const shown = drag?.box ?? result?.box;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <p className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="mr-3 font-mono text-xs font-normal uppercase tracking-[0.18em] text-fog">
            {tr(copy.draw)}
          </span>
          {target.w} × {target.h}
        </p>
        <p className="font-mono text-xs text-fog">
          {tr(copy.round)}{" "}
          <span className="text-bone">
            {Math.min(round, ROUNDS)}/{ROUNDS}
          </span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.score)} <span className="text-bone">{total}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.best)} <span className="text-signal">{best ?? "—"}</span>
        </p>
      </div>

      <div
        ref={board}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
        className="relative h-[min(60vh,480px)] min-h-[340px] cursor-crosshair touch-none select-none overflow-hidden rounded-sm border border-line bg-ink/90 bg-[radial-gradient(rgba(236,237,230,0.12)_1px,transparent_1.5px)] bg-[length:24px_24px]"
      >
        {!shown && (
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-sm text-fog">
            {tr(copy.hint)}
          </p>
        )}

        {/* After scoring, the target size drawn from the same corner, for comparison */}
        {result && (
          <Frame
            box={{
              x: result.box.x,
              y: result.box.y,
              w: result.target.w,
              h: result.target.h,
            }}
            className="border-dashed border-fog text-fog"
          />
        )}

        {shown && (
          <Frame
            box={shown}
            className="border-signal bg-signal/5 text-signal"
            label={`${Math.round(shown.w)} × ${Math.round(shown.h)}`}
          />
        )}

        {result && (
          <div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-4 border-b border-line bg-ink/85 px-4 py-3 font-mono text-sm backdrop-blur">
            <span
              className={cn(result.error === 0 ? "text-signal" : "text-bone")}
            >
              {result.error === 0
                ? tr(copy.perfect)
                : `${tr(copy.off)} ${result.error}px`}
            </span>
            <span className="text-signal">+{result.points}</span>
            {finished ? (
              <>
                <span className="text-fog">
                  {tr(copy.done)} <span className="text-bone">{total}/500</span>
                  {newBest && (
                    <span className="ml-2 text-signal">{tr(copy.newBest)}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full border border-signal px-4 py-1.5 text-xs text-bone transition-colors hover:bg-signal hover:text-ink"
                >
                  {tr(copy.again)}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={nextRound}
                className="rounded-full border border-signal px-4 py-1.5 text-xs text-bone transition-colors hover:bg-signal hover:text-ink"
              >
                {tr(copy.next)}
              </button>
            )}
          </div>
        )}
      </div>

      <ol className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
        {Array.from({ length: ROUNDS }, (_, i) => {
          const r = results[i];
          return (
            <li
              key={i}
              className={cn(
                "rounded-full border px-3 py-1",
                r ? "border-signal/50 text-bone" : "border-line text-fog",
              )}
            >
              {i + 1}. {r ? `+${r.points}` : "—"}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default PixelGame;
