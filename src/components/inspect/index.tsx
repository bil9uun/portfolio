import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ui, useT } from "@/lib/i18n";
import { typingSecret } from "@/lib/party";
import { inspectMode, isTyping, useStore } from "@/lib/store";

type Box = { top: number; right: number; bottom: number; left: number };

type Info = {
  rect: DOMRect;
  margin: Box;
  padding: Box;
  border: Box;
  tag: string;
  className: string;
  font: string;
  color: string;
  fill: string | null;
};

const px = (value: string) => parseFloat(value) || 0;
const box = (cs: CSSStyleDeclaration, prop: "margin" | "padding") => ({
  top: px(cs.getPropertyValue(`${prop}-top`)),
  right: px(cs.getPropertyValue(`${prop}-right`)),
  bottom: px(cs.getPropertyValue(`${prop}-bottom`)),
  left: px(cs.getPropertyValue(`${prop}-left`)),
});
const borderBox = (cs: CSSStyleDeclaration) => ({
  top: px(cs.borderTopWidth),
  right: px(cs.borderRightWidth),
  bottom: px(cs.borderBottomWidth),
  left: px(cs.borderLeftWidth),
});
const sides = (b: Box) =>
  [b.top, b.right, b.bottom, b.left].map(Math.round).join(" ");

// Any CSS colour (oklch, color-mix…) to #rrggbb by painting one pixel.
const ctx = document
  .createElement("canvas")
  .getContext("2d", { willReadFrequently: true });
const toHex = (color: string) => {
  if (!ctx) return color;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  return a < 255 ? `${hex} ${Math.round((a / 255) * 100)}%` : hex;
};
const isTransparent = (color: string) =>
  color === "transparent" || /rgba?\(.*,\s*0\)$/.test(color);

// Page scaffolding is not worth inspecting.
const SKIP = new Set(["HTML", "BODY", "MAIN"]);
const inspectable = (el: Element) =>
  !SKIP.has(el.tagName) &&
  !el.closest("[data-inspect-ui]") &&
  el.id !== "smooth-wrapper" &&
  el.id !== "smooth-content";

const measure = (el: Element): Info => {
  const cs = getComputedStyle(el);
  const family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
  const lineHeight =
    cs.lineHeight === "normal" ? "normal" : `${Math.round(px(cs.lineHeight))}`;
  return {
    rect: el.getBoundingClientRect(),
    margin: box(cs, "margin"),
    padding: box(cs, "padding"),
    border: borderBox(cs),
    tag: el.tagName.toLowerCase(),
    className: el.classList[0] ?? "",
    font: `${family} · ${Math.round(px(cs.fontSize))}/${lineHeight} · ${cs.fontWeight}`,
    color: toHex(cs.color),
    fill: isTransparent(cs.backgroundColor) ? null : toHex(cs.backgroundColor),
  };
};

const Swatch = ({ color }: { color: string }) => (
  <span
    className="inline-block size-2.5 rounded-sm border border-white/20 align-[-1px]"
    style={{ background: color }}
  />
);

// Hover anything to see its box model, type and colours, like a design tool.
// Toggle with "I", the command palette or the footer; Esc exits.
const InspectOverlay = () => {
  const tr = useT();
  const on = useStore(inspectMode);
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "i" || e.key === "I") {
        // The "i" in a secret word like "bilguun" isn't a request to inspect.
        if (!typingSecret()) inspectMode.set(!inspectMode.get());
      } else if (e.key === "Escape") inspectMode.set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!on) {
      setInfo(null);
      return;
    }
    let target: Element | null = null;
    let frame = 0;
    const update = () => {
      frame = 0;
      setInfo(target?.isConnected ? measure(target) : null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      target = el && inspectable(el) ? el : null;
      schedule();
    };

    document.documentElement.classList.add("inspecting");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      document.documentElement.classList.remove("inspecting");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [on]);

  if (!on) return null;

  const r = info?.rect;
  const below = r ? r.bottom + 170 < window.innerHeight : true;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]">
      {info && r && (
        <div aria-hidden>
          {/* margin */}
          <div
            className="absolute bg-[#FFB020]/15"
            style={{
              left: r.left - info.margin.left,
              top: r.top - info.margin.top,
              width: r.width + info.margin.left + info.margin.right,
              height: r.height + info.margin.top + info.margin.bottom,
            }}
          />
          {/* border box, with padding shaded */}
          <div
            className="absolute bg-signal/15 outline outline-1 outline-signal"
            style={{
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
            }}
          />
          {/* content box */}
          <div
            className="absolute bg-[#4D8DFF]/20"
            style={{
              left: r.left + info.border.left + info.padding.left,
              top: r.top + info.border.top + info.padding.top,
              width: Math.max(
                0,
                r.width -
                  info.border.left -
                  info.border.right -
                  info.padding.left -
                  info.padding.right,
              ),
              height: Math.max(
                0,
                r.height -
                  info.border.top -
                  info.border.bottom -
                  info.padding.top -
                  info.padding.bottom,
              ),
            }}
          />
          <div
            className="absolute w-max max-w-[min(22rem,calc(100vw-2rem))] space-y-1 rounded-md border border-line bg-ink/95 p-3 font-mono text-[11px] leading-4 text-fog shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            style={{
              left: Math.max(16, Math.min(r.left, window.innerWidth - 360)),
              top: below ? r.bottom + 8 : Math.max(16, r.top - 8),
              transform: below ? undefined : "translateY(-100%)",
            }}
          >
            <p className="truncate text-bone">
              <span className="text-signal">{info.tag}</span>
              {info.className && `.${info.className}`}
              <span className="ml-3 text-fog">
                {Math.round(r.width)} × {Math.round(r.height)}
              </span>
            </p>
            <p className="truncate">Aa {info.font}</p>
            <p>
              <Swatch color={info.color} /> {info.color}
              {info.fill && (
                <>
                  <span className="mx-2 text-line">|</span>
                  <Swatch color={info.fill} /> {info.fill}
                </>
              )}
            </p>
            <p>
              <span className="text-signal">padding</span> {sides(info.padding)}
              <span className="mx-2 text-line">|</span>
              <span className="text-[#FFB020]">margin</span>{" "}
              {sides(info.margin)}
            </p>
          </div>
        </div>
      )}

      <div
        data-inspect-ui
        className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-signal/60 bg-ink/90 py-2 pl-4 pr-2 font-mono text-[11px] text-bone shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-signal" />
        {tr(ui.inspectHint)}
        <button
          type="button"
          onClick={() => inspectMode.set(false)}
          aria-label={tr(ui.close)}
          className="rounded-full p-1 text-fog hover:bg-graphite hover:text-bone"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InspectOverlay;
