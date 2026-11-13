import { useEffect, useState, type ReactNode } from "react";
import { hudOnline, locale } from "@/sections/afk/data";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// The pieces every HUD panel is built from: panel, label, readout and a
// number that counts up when the HUD comes online.

// A number that counts up when the HUD comes online.
export const Count = ({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) => {
  const lang = useLang();
  const online = useStore(hudOnline);
  const [shown, setShown] = useState(() =>
    hudOnline.get() || prefersReducedMotion() ? value : 0,
  );
  useEffect(() => {
    if (!online) return;
    const v = { n: 0 };
    const tween = gsap.to(v, {
      n: value,
      duration: 1.4,
      ease: "power3.out",
      onUpdate: () => setShown(v.n),
    });
    return () => void tween.kill();
  }, [online, value]);
  return (
    <span className="tabular-nums">
      {shown.toLocaleString(locale(lang), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// HUD panel: hairline border with bright corner brackets.
export const Panel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "relative border border-line bg-ink/70 p-5 backdrop-blur-sm md:p-6",
      className,
    )}
  >
    {[
      "left-0 top-0 border-l-2 border-t-2",
      "right-0 top-0 border-r-2 border-t-2",
      "bottom-0 left-0 border-b-2 border-l-2",
      "bottom-0 right-0 border-b-2 border-r-2",
    ].map((pos) => (
      <span
        key={pos}
        aria-hidden
        className={cn("absolute -m-px size-3 border-[#FF7A45]", pos)}
      />
    ))}
    {children}
  </div>
);

export const Label = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
    {children}
  </p>
);

// A stat readout, optionally with a meter for percentages.
export const Readout = ({
  label,
  children,
  meter,
}: {
  label: string;
  children: ReactNode;
  meter?: number;
}) => (
  <div className="border-l border-line pl-4">
    <Label>{label}</Label>
    <p className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
      {children}
    </p>
    {meter !== undefined && (
      <div aria-hidden className="mt-3 h-1 bg-line">
        <div
          data-meter
          className="h-full origin-left bg-signal"
          style={{ width: `${meter}%` }}
        />
      </div>
    )}
  </div>
);
