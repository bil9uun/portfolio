import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, click } from "@/lib/sound";
import { useBest, useHideSwarm } from "@/components/games/use-best";
import { cn } from "@/lib/utils";

// Code Typing: type a snippet of everyday React and TypeScript.
// Indentation after a new line is filled in for you.

const copy = {
  focus: t("Click here and start typing", "Энд дарж бичиж эхлээрэй"),
  wpm: t("WPM", "WPM"),
  accuracy: t("Accuracy", "Нарийвчлал"),
  best: t("Best", "Шилдэг"),
  done: t("Done", "Дууслаа"),
  newBest: t("New best!", "Шинэ дээд амжилт!"),
  next: t("Next snippet", "Дараагийн код"),
  restart: t("Restart", "Дахин эхлэх"),
};

// Written for this game in the style of the stack I use; not taken from client code.
const SNIPPETS = [
  `const { data, isLoading } = useQuery({
  queryKey: ["orders", page],
  queryFn: () => api.get(\`/orders?page=\${page}\`),
});`,
  `export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));`,
  `const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(8),
  agree: z.literal(true),
});`,
  `useEffect(() => {
  const id = setInterval(refetch, 30_000);
  return () => clearInterval(id);
}, [refetch]);`,
  `export default function Price({ value }: { value: number }) {
  const formatted = value.toLocaleString("en-US");
  return <span className="font-mono">{formatted}</span>;
}`,
  `function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
];

const pick = (not?: string) => {
  const options = SNIPPETS.filter((s) => s !== not);
  return options[Math.floor(Math.random() * options.length)];
};

const TypingGame = () => {
  const tr = useT();
  useHideSwarm();
  const input = useRef<HTMLTextAreaElement>(null);
  const [target, setTarget] = useState(() => pick());
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    best: boolean;
  } | null>(null);
  const [best, submit] = useBest("typing", "higher");

  useEffect(() => {
    if (start === null || result) return;
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, [start, result]);

  const correct = [...typed].filter((ch, i) => ch === target[i]).length;
  const minutes = start === null ? 0 : ((now || start) - start) / 60000;
  const liveWpm = minutes > 0.02 ? Math.round(correct / 5 / minutes) : 0;
  const accuracy = keystrokes
    ? Math.round(((keystrokes - mistakes) / keystrokes) * 100)
    : 100;

  const reset = (next = target) => {
    setTarget(next);
    setTyped("");
    setKeystrokes(0);
    setMistakes(0);
    setStart(null);
    setNow(0);
    setResult(null);
    requestAnimationFrame(() => input.current?.focus());
  };

  const onChange = (value: string) => {
    if (result) return;
    if (value.length < typed.length) {
      setTyped(value); // backspace
      return;
    }
    const at = performance.now();
    if (start === null) setStart(at);
    let next = typed;
    let strokes = 0;
    let wrong = 0;
    for (const ch of value.slice(typed.length)) {
      if (next.length >= target.length) break;
      strokes++;
      if (ch !== target[next.length]) wrong++;
      next += ch;
      // After a new line, fill in the indentation.
      if (ch === "\n") {
        while (next.length < target.length && target[next.length] === " ")
          next += " ";
      }
    }
    setTyped(next);
    setKeystrokes((k) => k + strokes);
    setMistakes((m) => m + wrong);
    click({ pitch: wrong ? 0.6 : 0.9 + Math.random() * 0.3, gain: 0.025 });

    if (next.length === target.length) {
      const end = performance.now();
      const mins = (end - (start ?? at)) / 60000;
      const good = [...next].filter((ch, i) => ch === target[i]).length;
      const wpm = Math.round(good / 5 / Math.max(mins, 1 / 600));
      const acc = Math.round(
        ((keystrokes + strokes - mistakes - wrong) / (keystrokes + strokes)) *
          100,
      );
      setNow(end);
      setResult({ wpm, accuracy: acc, best: submit(wpm) });
      blip({ size: 0.15 });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-fog">
        <p>
          {tr(copy.wpm)}{" "}
          <span className="text-bone">{result?.wpm ?? liveWpm}</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.accuracy)}{" "}
          <span className="text-bone">{result?.accuracy ?? accuracy}%</span>
          <span className="mx-2 text-line">|</span>
          {tr(copy.best)} <span className="text-signal">{best ?? "—"}</span>
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-signal hover:text-bone"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          {tr(copy.restart)}
        </button>
      </div>

      <div
        onClick={() => input.current?.focus()}
        className={cn(
          "relative cursor-text overflow-x-auto rounded-sm border bg-ink/90 p-6 md:p-8",
          focused ? "border-signal/60" : "border-line",
        )}
      >
        <textarea
          ref={input}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => e.preventDefault()}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the code"
          className="absolute inset-0 resize-none opacity-0"
        />
        <pre className="pointer-events-none whitespace-pre font-mono text-[15px] leading-7 md:text-lg">
          {[...target].map((ch, i) => {
            const done = i < typed.length;
            const wrong = done && typed[i] !== ch;
            const caret = i === typed.length && focused && !result;
            return (
              <span
                key={i}
                className={cn(
                  "relative",
                  done
                    ? wrong
                      ? "bg-[#FF6B6B]/25 text-[#FF6B6B]"
                      : "text-bone"
                    : "text-fog/45",
                )}
              >
                {caret && (
                  <span
                    aria-hidden
                    className="absolute -left-px top-1 h-5 w-0.5 animate-caret bg-signal md:h-6"
                  />
                )}
                {ch === "\n" ? (wrong ? "↵\n" : "\n") : ch}
              </span>
            );
          })}
        </pre>
        {!focused && !result && (
          <p className="absolute inset-x-0 bottom-3 text-center font-mono text-xs text-signal">
            {tr(copy.focus)}
          </p>
        )}
      </div>

      {result && (
        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-sm">
          <span className="text-bone">
            {tr(copy.done)}: {result.wpm} WPM · {result.accuracy}%
          </span>
          {result.best && (
            <span className="text-signal">{tr(copy.newBest)}</span>
          )}
          <button
            type="button"
            onClick={() => reset(pick(target))}
            className="rounded-full border border-signal px-4 py-1.5 text-xs text-bone transition-colors hover:bg-signal hover:text-ink"
          >
            {tr(copy.next)}
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;
