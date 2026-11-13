import { useEffect, useRef, useState } from "react";
import { Bug, Flag, RotateCcw } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { formatTime, useBest, useHideSwarm } from "@/games/use-best";
import { cn } from "@/lib/utils";
import { pillButton } from "@/components/ui/styles";

// Bug Hunt: every number counts the bugs in the cells around it.
// Open every safe cell without opening a bug. The first click is always safe.

const copy = {
  bugsLeft: t("Bugs left", "Үлдсэн bug"),
  time: t("Time", "Хугацаа"),
  best: t("Best", "Шилдэг"),
  flagMode: t("Flag mode", "Тэмдэглэх горим"),
  newGame: t("New game", "Шинэ тоглоом"),
  hint: t(
    "Click to open · right-click to flag",
    "Дарж нээх · баруун товчоор тэмдэглэх",
  ),
  won: t("Codebase clean", "Codebase цэвэрхэн боллоо"),
  lost: t("You opened a bug", "Bug нээчихлээ"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
};

type Cell = { bug: boolean; open: boolean; flag: boolean; near: number };
type Phase = "ready" | "playing" | "won" | "lost";

const NUMBER_COLORS = [
  "",
  "#4D8DFF",
  "#22C55E",
  "#FF6B6B",
  "#A57BFF",
  "#FFB020",
  "#2EC4D6",
  "#F2F2EA",
  "#8b9187",
];

const neighbours = (i: number, cols: number, rows: number) => {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows)
        out.push(ny * cols + nx);
    }
  return out;
};

const emptyBoard = (n: number): Cell[] =>
  Array.from({ length: n }, () => ({
    bug: false,
    open: false,
    flag: false,
    near: 0,
  }));

const BugsGame = () => {
  const tr = useT();
  useHideSwarm();
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ cols: 16, rows: 10, bugs: 24 });
  const [cells, setCells] = useState<Cell[]>(() => emptyBoard(160));
  const [phase, setPhase] = useState<Phase>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [time, setTime] = useState(0);
  const [lostAt, setLostAt] = useState(-1);
  const [newBest, setNewBest] = useState(false);
  const [best, submit] = useBest("bugs", "lower");
  const started = useRef(0);

  const newGame = () => {
    const narrow = (wrap.current?.clientWidth ?? 800) < 640;
    const next = narrow
      ? { cols: 9, rows: 12, bugs: 15 }
      : { cols: 16, rows: 10, bugs: 24 };
    setSize(next);
    setCells(emptyBoard(next.cols * next.rows));
    setPhase("ready");
    setTime(0);
    setLostAt(-1);
    setNewBest(false);
  };

  useEffect(() => {
    newGame();
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(
      () => setTime((performance.now() - started.current) / 1000),
      100,
    );
    return () => clearInterval(id);
  }, [phase]);

  // Lay bugs on the first click, keeping the clicked cell and its neighbours clear.
  const seed = (first: number) => {
    const { cols, rows, bugs } = size;
    const safe = new Set([first, ...neighbours(first, cols, rows)]);
    const board = emptyBoard(cols * rows);
    let placed = 0;
    while (placed < bugs) {
      const i = Math.floor(Math.random() * board.length);
      if (safe.has(i) || board[i].bug) continue;
      board[i].bug = true;
      placed++;
    }
    board.forEach((c, i) => {
      c.near = neighbours(i, cols, rows).filter((n) => board[n].bug).length;
    });
    return board;
  };

  const open = (i: number) => {
    if (phase === "won" || phase === "lost") return;
    let board = cells;
    if (phase === "ready") {
      board = seed(i);
      started.current = performance.now();
      setPhase("playing");
    }
    if (board[i].flag || board[i].open) return;
    const next = board.map((c) => ({ ...c }));

    if (next[i].bug) {
      next.forEach((c) => {
        if (c.bug) c.open = true;
      });
      setCells(next);
      setLostAt(i);
      setPhase("lost");
      blip({ size: 1, gain: 0.05 });
      return;
    }

    // Flood-open empty areas.
    const stack = [i];
    while (stack.length) {
      const j = stack.pop()!;
      if (next[j].open || next[j].flag) continue;
      next[j].open = true;
      if (next[j].near === 0)
        stack.push(...neighbours(j, size.cols, size.rows));
    }
    setCells(next);
    click({ pitch: 1.1, gain: 0.03 });

    if (next.every((c) => c.bug || c.open)) {
      const total = (performance.now() - started.current) / 1000;
      setTime(total);
      setPhase("won");
      setNewBest(submit(Math.round(total * 10) / 10));
      blip({ size: 0.1 });
    }
  };

  const toggleFlag = (i: number) => {
    if (phase !== "playing" || cells[i].open) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
    click({ pitch: 0.8, gain: 0.03 });
  };

  const flags = cells.filter((c) => c.flag).length;
  const over = phase === "won" || phase === "lost";

  return (
    <div ref={wrap}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-fog">
        <p>
          {tr(copy.bugsLeft)}{" "}
          <span className="text-bone">{size.bugs - flags}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.time)} <span className="text-bone">{formatTime(time)}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.best)}{" "}
          <span className="text-signal">
            {best === null ? "—" : formatTime(best)}
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFlagMode((f) => !f)}
            aria-pressed={flagMode}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
              flagMode
                ? "border-signal text-bone"
                : "border-line hover:text-bone",
            )}
          >
            <Flag
              aria-hidden
              className={cn("size-3.5", flagMode && "text-signal")}
            />
            {tr(copy.flagMode)}
          </button>
          <button
            type="button"
            onClick={newGame}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-signal hover:text-bone"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            {tr(copy.newGame)}
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          role="grid"
          aria-label="Bug Hunt"
          className="grid gap-px rounded-sm border border-line bg-line"
          style={{
            gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {cells.map((cell, i) => {
            const showBug = cell.open && cell.bug;
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={
                  cell.open
                    ? cell.bug
                      ? "bug"
                      : String(cell.near || "empty")
                    : cell.flag
                      ? "flagged"
                      : "closed"
                }
                disabled={over}
                onClick={() => (flagMode ? toggleFlag(i) : open(i))}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "f" || e.key === "F") toggleFlag(i);
                }}
                className={cn(
                  "grid aspect-square place-items-center font-mono text-sm font-medium transition-colors md:text-base",
                  cell.open
                    ? "bg-ink"
                    : "bg-graphite hover:bg-[#20241e] focus-visible:z-10",
                  showBug &&
                    (i === lostAt ? "bg-[#FF6B6B]/30" : "bg-[#FF6B6B]/10"),
                )}
                style={
                  cell.open && !cell.bug
                    ? { color: NUMBER_COLORS[cell.near] }
                    : undefined
                }
              >
                {showBug ? (
                  <Bug aria-hidden className="size-[55%] text-[#FF6B6B]" />
                ) : cell.flag ? (
                  <Flag aria-hidden className="size-[50%] text-signal" />
                ) : cell.open && cell.near ? (
                  cell.near
                ) : !cell.open ? (
                  <span
                    aria-hidden
                    className="size-0.5 rounded-full bg-bone/20"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {over && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="pointer-events-auto rounded-lg border border-line bg-ink/90 px-8 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur">
              <p className="font-display text-4xl font-semibold tracking-tight">
                {tr(phase === "won" ? copy.won : copy.lost)}
              </p>
              {phase === "won" && (
                <p className="mt-2 font-mono text-sm text-fog">
                  {formatTime(time)}
                  {newBest && (
                    <span className="ml-3 text-signal">{tr(copy.newBest)}</span>
                  )}
                </p>
              )}
              <button
                type="button"
                onClick={newGame}
                className={cn(pillButton, "mt-5")}
              >
                {tr(copy.newGame)}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 font-mono text-xs text-fog pointer-coarse:hidden">
        {tr(copy.hint)}
      </p>
    </div>
  );
};

export default BugsGame;
