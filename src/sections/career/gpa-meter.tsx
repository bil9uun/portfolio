import { ui, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const GPA_SCALE = 4;
const GPA_TICKS = 40;

// GPA on a ruler: one tick per 0.1, taller ticks at each whole point.
const GpaMeter = ({ gpa }: { gpa: number }) => {
  const tr = useT();
  const filled = Math.round((gpa / GPA_SCALE) * GPA_TICKS);
  return (
    <div
      role="meter"
      aria-label={tr(ui.gpa)}
      aria-valuemin={0}
      aria-valuemax={GPA_SCALE}
      aria-valuenow={gpa}
      className="w-full md:ml-auto md:max-w-64"
    >
      <p className="flex items-baseline gap-2 md:justify-end">
        <span className="font-display text-5xl font-semibold leading-none tracking-tight md:text-6xl">
          {gpa.toFixed(1)}
        </span>
        <span className="font-mono text-xs text-fog">
          / {GPA_SCALE.toFixed(1)} {tr(ui.gpa)}
        </span>
      </p>
      <div aria-hidden className="mt-4 flex h-6 items-end justify-between">
        {Array.from({ length: GPA_TICKS }, (_, i) => (
          <span
            key={i}
            data-tick
            className={cn(
              "w-px origin-bottom",
              (i + 1) % 10 === 0 ? "h-6" : "h-3.5",
              i < filled ? "bg-signal" : "bg-line",
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default GpaMeter;
