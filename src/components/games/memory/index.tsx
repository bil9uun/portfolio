import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { SKILLS } from "@/components/games/canvas";
import { formatTime, useBest, useHideSwarm } from "@/components/games/use-best";
import { cn } from "@/lib/utils";

// Stack Memory: flip two cards at a time and find every pair of skills.

const copy = {
  moves: t("Moves", "Нүүдэл"),
  time: t("Time", "Хугацаа"),
  pairs: t("Pairs", "Хос"),
  best: t("Best", "Шилдэг"),
  movesUnit: t("moves", "нүүдэл"),
  newGame: t("New game", "Шинэ тоглоом"),
  won: t("Stack complete", "Stack бүрдлээ"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
  hint: t(
    "Flip two cards to find a pair.",
    "Хоёр карт эргүүлж хосыг нь олоорой.",
  ),
};

const PAIRS = 8;
type Card = { id: number; name: string; color: string; matched: boolean };

const deal = (): Card[] => {
  const picks = [...SKILLS].sort(() => Math.random() - 0.5).slice(0, PAIRS);
  return [...picks, ...picks]
    .map(([name, color], i) => ({ id: i, name, color, matched: false }))
    .sort(() => Math.random() - 0.5);
};

const MemoryGame = () => {
  const tr = useT();
  useHideSwarm();
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<number[]>([]); // indexes face up and unmatched
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [best, submit] = useBest("memory", "lower");
  const busy = useRef(false);

  useEffect(() => {
    if (start === null || won) return;
    const id = setInterval(
      () => setTime((performance.now() - start) / 1000),
      100,
    );
    return () => clearInterval(id);
  }, [start, won]);

  const newGame = () => {
    setCards(deal());
    setOpen([]);
    setMoves(0);
    setStart(null);
    setTime(0);
    setWon(false);
    setNewBest(false);
    busy.current = false;
  };

  const flip = (i: number) => {
    if (busy.current || won || cards[i].matched || open.includes(i)) return;
    if (start === null) setStart(performance.now());
    click({ pitch: 1.1, gain: 0.03 });
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next;
    if (cards[a].name === cards[b].name) {
      const matched = cards.map((c, j) =>
        j === a || j === b ? { ...c, matched: true } : c,
      );
      setCards(matched);
      setOpen([]);
      blip({ size: 0.3, gain: 0.03 });
      if (matched.every((c) => c.matched)) {
        const total = (performance.now() - (start ?? performance.now())) / 1000;
        setTime(total);
        setWon(true);
        setNewBest(submit(moves + 1));
        blip({ size: 0.1 });
      }
    } else {
      // Show the miss for a moment, then turn both back.
      busy.current = true;
      setTimeout(() => {
        setOpen([]);
        busy.current = false;
      }, 750);
    }
  };

  const found = cards.filter((c) => c.matched).length / 2;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-fog">
        <p>
          {tr(copy.moves)} <span className="text-bone">{moves}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.pairs)}{" "}
          <span className="text-bone">
            {found}/{PAIRS}
          </span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.time)} <span className="text-bone">{formatTime(time)}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.best)}{" "}
          <span className="text-signal">
            {best === null ? "—" : `${best} ${tr(copy.movesUnit)}`}
          </span>
        </p>
        <button
          type="button"
          onClick={newGame}
          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-signal hover:text-bone"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          {tr(copy.newGame)}
        </button>
      </div>

      <div className="relative">
        <ul className="mx-auto grid max-w-xl grid-cols-4 gap-2 md:gap-3">
          {cards.map((card, i) => {
            const faceUp = card.matched || open.includes(i);
            return (
              <li key={card.id} className="aspect-[4/5] [perspective:800px]">
                <button
                  type="button"
                  onClick={() => flip(i)}
                  aria-label={faceUp ? card.name : `Card ${i + 1}`}
                  aria-pressed={faceUp}
                  className={cn(
                    "relative size-full rounded-md transition-transform duration-500 [transform-style:preserve-3d]",
                    faceUp && "[transform:rotateY(180deg)]",
                  )}
                >
                  {/* Back: a dotted canvas with a selection handle */}
                  <span className="absolute inset-0 grid place-items-center rounded-md border border-line bg-graphite bg-[radial-gradient(rgba(236,237,230,0.12)_1px,transparent_1.5px)] bg-[length:14px_14px] [backface-visibility:hidden] hover:border-signal/60">
                    <span className="size-3 border border-signal bg-ink" />
                  </span>
                  {/* Front: the skill */}
                  <span
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md border bg-ink p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
                      card.matched ? "border-signal" : "border-line",
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-1 w-8 rounded-full"
                      style={{ background: card.color }}
                    />
                    <span className="font-display text-sm font-semibold leading-tight tracking-tight sm:text-lg">
                      {card.name}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {won && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="pointer-events-auto rounded-lg border border-line bg-ink/90 px-8 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur">
              <p className="font-display text-4xl font-semibold tracking-tight">
                {tr(copy.won)}
              </p>
              <p className="mt-2 font-mono text-sm text-fog">
                {moves} {tr(copy.movesUnit)} · {formatTime(time)}
                {newBest && (
                  <span className="ml-3 text-signal">{tr(copy.newBest)}</span>
                )}
              </p>
              <button
                type="button"
                onClick={newGame}
                className="mt-5 rounded-full border border-signal px-5 py-2.5 text-sm transition-colors hover:bg-signal hover:text-ink"
              >
                {tr(copy.newGame)}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center font-mono text-xs text-fog">
        {tr(copy.hint)}
      </p>
    </div>
  );
};

export default MemoryGame;
