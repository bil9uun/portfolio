import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pause, Play, ScanEye } from "lucide-react";
import { finishes, useGroups, type UseItem } from "@/content/uses";
import { t, useT } from "@/lib/i18n";
import { click } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { DeskAnim } from "@/components/desk-3d/anim";
import { CASE, DESKS, PC_PARTS } from "@/components/desk-3d/layout";

// Three.js loads only when this viewer is on the page.
const DeskScene = lazy(() => import("@/components/desk-3d/scene"));

const copy = {
  hint: t(
    "Drag to orbit · click anything",
    "Чирж эргүүлэх · дурын зүйл дээр дар",
  ),
  hintTouch: t("Tap anything to inspect it", "Дурын зүйл дээр дарж үзээрэй"),
  explode: t("Explode", "Задлах"),
  xray: t("X-ray", "X-ray"),
  tour: t("Tour", "Аялал"),
  play: t("Play the tour", "Аяллыг тоглуулах"),
  pause: t("Pause the tour", "Аяллыг зогсоох"),
  inspect: t("Inspect", "Inspect"),
  pick: t(
    "Pick something on the desk, or take the tour.",
    "Ширээн дээрх зүйлийг сонгох эсвэл аяллыг эхлүүлээрэй.",
  ),
  finish: t("Finish", "Өнгө"),
  inside: t("Inside", "Дотор нь"),
  loading: t("Setting up the desk…", "Ширээг бэлдэж байна…"),
  noWebgl: t(
    "3D isn't available in this browser. Everything is listed below.",
    "Энэ хөтөч 3D дэмждэггүй байна. Бүх зүйл доор жагсаалтаар байгаа.",
  ),
};

const items = new Map(
  useGroups.flatMap((g) => g.items).map((item) => [item.name, item]),
);
const TOUR_STEP_MS = 3800;

// No WebGL (or a GPU hiccup): show a note instead of a broken canvas.
class WebglBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Inspector = ({
  name,
  onPick,
}: {
  name: string | null;
  onPick: (name: string) => void;
}) => {
  const tr = useT();
  const item = name ? (items.get(name) as UseItem | undefined) : undefined;
  if (!item)
    return <p className="text-sm leading-relaxed text-fog">{tr(copy.pick)}</p>;
  const finish = item.color && finishes[item.color];
  return (
    <div aria-live="polite">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
        {tr(copy.inspect)} · {tr(item.kind)}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
        {item.name}
      </p>
      {item.detail && (
        <p className="mt-1 font-mono text-xs text-fog">{tr(item.detail)}</p>
      )}
      {finish && (
        <p className="mt-4 flex items-center gap-2 font-mono text-xs text-fog">
          {tr(copy.finish)}
          <span
            aria-hidden
            className="size-3 rounded-full border border-line"
            style={{ background: finish.hex }}
          />
          <span className="text-bone">{tr(finish.label)}</span>
        </p>
      )}
      {item.name === CASE && (
        <div className="mt-5 border-t border-line pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
            {tr(copy.inside)}
          </p>
          <ul className="mt-2 font-mono text-[11px]">
            {PC_PARTS.map((part) => {
              const p = items.get(part.name);
              return (
                <li key={part.name}>
                  <button
                    type="button"
                    onClick={() => onPick(part.name)}
                    className="flex w-full gap-3 py-1 text-left transition-colors hover:text-signal"
                  >
                    <span className="w-24 shrink-0 text-fog">
                      {p ? tr(p.kind) : ""}
                    </span>
                    <span className="text-bone">{part.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// My two desks in 3D: explode them, x-ray the PC, take a camera tour.
const Desk3D = () => {
  const tr = useT();
  const [deskId, setDeskId] = useState<(typeof DESKS)[number]["id"]>("gaming");
  const desk = DESKS.find((d) => d.id === deskId)!;
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [explode, setExplode] = useState(0);
  const [xray, setXray] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const anim = useRef<DeskAnim>({
    explode: 0,
    explodeTarget: 0,
    xray: 0,
    xrayTarget: 0,
  });
  const orbit = window.matchMedia("(pointer: fine)").matches;
  const loading = (
    <p className="absolute inset-0 grid place-items-center font-mono text-xs text-fog">
      {tr(copy.loading)}
    </p>
  );

  useEffect(() => void (anim.current.explodeTarget = explode), [explode]);
  useEffect(() => void (anim.current.xrayTarget = xray ? 1 : 0), [xray]);

  // Load Three.js once the viewer comes near, and render only while it's
  // on screen.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = frame.current!;
    const soon = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "800px 0px" },
    );
    const visible = new IntersectionObserver(([e]) =>
      setRunning(e.isIntersecting),
    );
    soon.observe(el);
    visible.observe(el);
    return () => {
      soon.disconnect();
      visible.disconnect();
    };
  }, []);

  const goTo = (i: number) => {
    const step = desk.tour[i];
    setStepIndex(i);
    setXray(!!step.xray);
    setSelected(step.select ?? null);
  };

  // The tour plays itself, one step every few seconds, then stops.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (stepIndex + 1 >= desk.tour.length) setPlaying(false);
      else goTo(stepIndex + 1);
    }, TOUR_STEP_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIndex]);

  const switchDesk = (id: typeof deskId) => {
    if (id === deskId) return;
    setDeskId(id);
    setStepIndex(0);
    setSelected(null);
    setXray(false);
    setPlaying(false);
    click({ pitch: 0.9, gain: 0.03 });
  };

  const select = (name: string | null) => {
    setSelected(name);
    setPlaying(false);
    if (name) click({ pitch: 1.2, gain: 0.03 });
    // Picking a part inside the PC opens it up.
    if (name && PC_PARTS.some((p) => p.name === name)) setXray(true);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          className="inline-flex rounded-full border border-line p-1 font-mono text-xs"
        >
          {DESKS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={deskId === d.id}
              onClick={() => switchDesk(d.id)}
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors",
                deskId === d.id
                  ? "bg-bone text-ink"
                  : "text-fog hover:text-bone",
              )}
            >
              {tr(d.label)}
            </button>
          ))}
        </div>

        {/* Camera tour */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-fog">
            {tr(copy.tour)}
          </span>
          {desk.tour.map((step, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPlaying(false);
                goTo(i);
              }}
              aria-pressed={stepIndex === i}
              className={cn(
                "rounded-full border px-3 py-1.5 transition-colors",
                stepIndex === i
                  ? "border-signal text-bone"
                  : "border-line text-fog hover:text-bone",
              )}
            >
              <span className="text-signal">{i + 1}</span> {tr(step.label)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (!playing && stepIndex === desk.tour.length - 1) goTo(0);
              setPlaying(!playing);
            }}
            aria-label={tr(playing ? copy.pause : copy.play)}
            title={tr(playing ? copy.pause : copy.play)}
            className="grid size-8 place-items-center rounded-full border border-signal text-signal transition-colors hover:bg-signal hover:text-ink"
          >
            {playing ? (
              <Pause aria-hidden className="size-3.5" />
            ) : (
              <Play aria-hidden className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div
          ref={frame}
          className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line bg-ink/60 md:aspect-[16/10] lg:col-span-8"
        >
          <div aria-hidden className="canvas-grid absolute inset-0" />
          <WebglBoundary
            fallback={
              <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-fog">
                {tr(copy.noWebgl)}
              </p>
            }
          >
            <Suspense fallback={loading}>
              {near ? (
                <DeskScene
                  desk={desk}
                  step={desk.tour[stepIndex]}
                  anim={anim}
                  selected={selected}
                  onSelect={select}
                  orbit={orbit}
                  running={running}
                />
              ) : (
                loading
              )}
            </Suspense>
          </WebglBoundary>

          <p className="pointer-events-none absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
            {tr(orbit ? copy.hint : copy.hintTouch)}
          </p>

          {/* Explode and x-ray */}
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-3 rounded-full border border-line bg-ink/85 px-4 py-2 font-mono text-xs backdrop-blur sm:inset-x-auto sm:left-3">
            <label className="flex items-center gap-3 text-fog">
              {tr(copy.explode)}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                onChange={(e) => {
                  setExplode(Number(e.target.value));
                  setPlaying(false);
                }}
                className="w-28 accent-[#22C55E]"
              />
            </label>
            {desk.id === "gaming" && (
              <button
                type="button"
                aria-pressed={xray}
                onClick={() => {
                  setXray(!xray);
                  setPlaying(false);
                  click({ pitch: 1, gain: 0.03 });
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors",
                  xray
                    ? "border-signal bg-signal text-ink"
                    : "border-line text-fog hover:text-bone",
                )}
              >
                <ScanEye aria-hidden className="size-3.5" />
                {tr(copy.xray)}
              </button>
            )}
          </div>
        </div>

        <aside className="rounded-sm border border-line bg-ink/60 p-5 lg:col-span-4">
          <Inspector name={selected} onPick={select} />
        </aside>
      </div>
    </div>
  );
};

export default Desk3D;
