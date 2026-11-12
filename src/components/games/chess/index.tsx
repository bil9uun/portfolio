import { useEffect, useRef, useState } from "react";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import { RotateCcw, Undo2 } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { readBest, useHideSwarm } from "@/components/games/use-best";
import { writeSetting } from "@/lib/store";
import { cn } from "@/lib/utils";

// Chess against the computer. Rules come from chess.js; the opponent is a
// small alpha-beta search over material and piece placement.

const copy = {
  level: t("Level", "Түвшин"),
  levels: [t("Easy", "Хялбар"), t("Normal", "Дунд"), t("Hard", "Хэцүү")],
  yourMove: t("Your move", "Таны нүүдэл"),
  thinking: t("Thinking…", "Бодож байна…"),
  check: t("Check!", "Шаг!"),
  youWin: t("Checkmate. You win!", "Мат. Та яллаа!"),
  youLose: t("Checkmate. The computer wins.", "Мат. Компьютер яллаа."),
  draw: t("Draw", "Тэнцээ"),
  newGame: t("New game", "Шинэ тоглоом"),
  undo: t("Take back", "Буцаах"),
  wins: t("Wins", "Хожил"),
  moves: t("Moves", "Нүүдлүүд"),
  promote: t("Pawns promote to a queen.", "Хүү хатан болж хувирна."),
};

const GLYPH: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};
const VALUE: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Piece-square tables from White's point of view (rank 8 first).
const PST: Partial<Record<PieceSymbol, number[]>> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
    20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5,
    -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
    0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
    20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
    -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10,
    0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20,
    -10, -10, -10, -10, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
    -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
    -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

// Score from Black's point of view (the computer plays Black).
function evaluate(game: Chess) {
  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const table = PST[p.type];
      const index = p.color === "w" ? r * 8 + f : (7 - r) * 8 + f;
      const value = VALUE[p.type] + (table ? table[index] : 0);
      score += p.color === "b" ? value : -value;
    }
  return score;
}

// Captures first, biggest victim first: alpha-beta prunes far more.
const ordered = (moves: Move[]) =>
  moves.sort(
    (a, b) =>
      (b.captured ? VALUE[b.captured] : 0) -
      (a.captured ? VALUE[a.captured] : 0),
  );

function search(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  black: boolean,
): number {
  if (game.isCheckmate()) return black ? -100000 - depth : 100000 + depth;
  if (game.isDraw() || game.isStalemate()) return 0;
  if (depth === 0) return evaluate(game);
  const moves = ordered(game.moves({ verbose: true }));
  if (black) {
    let best = -Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.max(best, search(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    game.move(m);
    best = Math.min(best, search(game, depth - 1, alpha, beta, true));
    game.undo();
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

function chooseMove(game: Chess, level: number): Move {
  const moves = ordered(game.moves({ verbose: true }));
  const depth = [1, 2, 3][level];
  const scored = moves.map((m) => {
    game.move(m);
    const score = search(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    return { m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Easy plays any move within a pawn of the best, to stay beatable.
  const slack = level === 0 ? 100 : 5;
  const good = scored.filter((s) => s.score >= scored[0].score - slack);
  return good[Math.floor(Math.random() * good.length)].m;
}

const FILES = "abcdefgh";

const ChessGame = () => {
  const tr = useT();
  useHideSwarm();
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [level, setLevel] = useState(1);
  const [thinking, setThinking] = useState(false);
  const [wins, setWins] = useState(() => readBest("chess") ?? 0);
  const g = game.current;
  void fen; // re-render on every position change

  const history = g.history({ verbose: true });
  const last = history[history.length - 1];
  const targets = selected ? g.moves({ square: selected, verbose: true }) : [];
  const over = g.isGameOver();

  const status = thinking
    ? tr(copy.thinking)
    : g.isCheckmate()
      ? tr(g.turn() === "b" ? copy.youWin : copy.youLose)
      : g.isDraw() || g.isStalemate()
        ? tr(copy.draw)
        : g.inCheck()
          ? tr(copy.check)
          : tr(copy.yourMove);

  const sync = () => setFen(g.fen());

  // The computer replies after a beat, so your move shows first.
  useEffect(() => {
    if (g.turn() !== "b" || g.isGameOver()) return;
    setThinking(true);
    const id = setTimeout(() => {
      const move = chooseMove(g, level);
      g.move(move);
      setThinking(false);
      sync();
      click({ pitch: move.captured ? 0.7 : 1, gain: 0.05 });
      if (g.isCheckmate()) blip({ size: 1 });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  const onSquare = (sq: Square) => {
    if (thinking || over || g.turn() !== "w") return;
    const piece = g.get(sq);
    if (selected) {
      const move = targets.find((m) => m.to === sq);
      if (move) {
        g.move({ from: move.from, to: move.to, promotion: "q" });
        setSelected(null);
        sync();
        click({ pitch: move.captured ? 0.7 : 1.2, gain: 0.05 });
        if (g.isCheckmate()) {
          blip({ size: 0.1 });
          const total = wins + 1;
          setWins(total);
          writeSetting("chess-best", String(total));
        }
        return;
      }
    }
    setSelected(piece?.color === "w" ? sq : null);
  };

  const newGame = () => {
    g.reset();
    setSelected(null);
    setThinking(false);
    sync();
  };

  const undo = () => {
    if (thinking) return;
    g.undo();
    if (g.turn() === "b") g.undo();
    setSelected(null);
    sync();
  };

  const pairs: string[][] = [];
  history.forEach((m, i) => {
    if (i % 2 === 0) pairs.push([m.san]);
    else pairs[pairs.length - 1].push(m.san);
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,560px)_1fr]">
      <div>
        <div
          role="grid"
          aria-label="Chess board"
          className="grid grid-cols-8 overflow-hidden rounded-sm border border-line"
        >
          {g.board().map((row, r) =>
            row.map((piece, f) => {
              const sq = `${FILES[f]}${8 - r}` as Square;
              const dark = (r + f) % 2 === 1;
              const target = targets.find((m) => m.to === sq);
              const isLast = last && (last.from === sq || last.to === sq);
              const inCheck =
                piece?.type === "k" && piece.color === g.turn() && g.inCheck();
              return (
                <button
                  key={sq}
                  type="button"
                  role="gridcell"
                  aria-label={`${sq}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                  onClick={() => onSquare(sq)}
                  className={cn(
                    "relative grid aspect-square place-items-center",
                    dark ? "bg-[#262b24]" : "bg-[#3a4036]",
                    isLast && "after:absolute after:inset-0 after:bg-signal/15",
                    selected === sq &&
                      "outline outline-2 -outline-offset-2 outline-signal",
                    inCheck && "bg-[#FF6B6B]/40",
                  )}
                >
                  {piece && (
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 select-none text-[min(9vw,3.25rem)] leading-none",
                        piece.color === "w"
                          ? "text-bone [text-shadow:0_1px_0_#0d0f0c,0_0_2px_#0d0f0c]"
                          : "text-ink [-webkit-text-stroke:1px_#ecede6]",
                      )}
                      style={{
                        fontFamily:
                          '"Apple Symbols","Segoe UI Symbol","Noto Sans Symbols 2",serif',
                      }}
                    >
                      {GLYPH[piece.type]}
                      {"︎"}
                    </span>
                  )}
                  {target && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute z-20 rounded-full",
                        target.captured
                          ? "inset-1 border-2 border-signal/80"
                          : "size-[28%] bg-signal/70",
                      )}
                    />
                  )}
                  {f === 0 && (
                    <span className="absolute left-1 top-0.5 font-mono text-[9px] text-fog">
                      {8 - r}
                    </span>
                  )}
                  {r === 7 && (
                    <span className="absolute bottom-0.5 right-1 font-mono text-[9px] text-fog">
                      {FILES[f]}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
        <p className="mt-4 font-mono text-xs text-fog">{tr(copy.promote)}</p>
      </div>

      <aside className="font-mono text-xs text-fog">
        <p
          aria-live="polite"
          className={cn(
            "font-display text-3xl font-semibold tracking-tight",
            g.isCheckmate() && g.turn() === "b" ? "text-signal" : "text-bone",
          )}
        >
          {status}
        </p>

        <div className="mt-8">
          <p className="uppercase tracking-[0.18em]">{tr(copy.level)}</p>
          <div className="mt-3 inline-flex rounded-full border border-line p-1">
            {copy.levels.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLevel(i)}
                aria-pressed={level === i}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  level === i ? "bg-signal text-ink" : "hover:text-bone",
                )}
              >
                {tr(name)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={newGame}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-signal hover:text-bone"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            {tr(copy.newGame)}
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!history.length || thinking}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-signal hover:text-bone disabled:opacity-40"
          >
            <Undo2 aria-hidden className="size-3.5" />
            {tr(copy.undo)}
          </button>
        </div>

        <p className="mt-6">
          {tr(copy.wins)} <span className="text-signal">{wins}</span>
        </p>

        <p className="mt-8 uppercase tracking-[0.18em]">{tr(copy.moves)}</p>
        <ol className="mt-3 max-h-64 overflow-y-auto border-t border-line">
          {pairs.map(([w, b], i) => (
            <li
              key={i}
              className="grid grid-cols-[2.5rem_1fr_1fr] border-b border-line py-1.5"
            >
              <span>{i + 1}.</span>
              <span className="text-bone">{w}</span>
              <span className="text-bone">{b ?? ""}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
};

export default ChessGame;
