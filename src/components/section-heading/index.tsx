import type { ReactNode } from "react";
import Build from "@/components/build";

type Props = { index: string; label: string; title: ReactNode };

const SectionHeading = ({ index, label, title }: Props) => (
  <Build
    label={`Heading · ${label}`}
    className="w-fit"
    frameClassName="-inset-x-3 -inset-y-2"
  >
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
      <span className="text-signal">{index}</span> // {label}
    </p>
    <h2 className="mt-5 font-display text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.015em]">
      {title}
    </h2>
  </Build>
);

export default SectionHeading;
