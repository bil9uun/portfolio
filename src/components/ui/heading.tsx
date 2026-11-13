import type { ReactNode } from "react";
import Build from "@/components/ui/build";
import WaveText from "@/components/ui/wave-text";
import { cn } from "@/lib/utils";

type Props = {
  /** Small line above the title, e.g. "02 // expertise". */
  eyebrow: ReactNode;
  title: string;
  /** A short paragraph under the title. */
  intro?: string;
  /** 1 for a page title, 2 (default) for a section title. */
  level?: 1 | 2;
  /** Layer name shown on the selection frame. */
  label: string;
  /** Draw on load instead of on scroll (page titles). */
  immediate?: boolean;
  delay?: number;
};

const SIZE = {
  1: "text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.03em]",
  2: "text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.015em]",
};

// Eyebrow, big title and an optional intro: the top of every section and page.
const Heading = ({
  eyebrow,
  title,
  intro,
  level = 2,
  label,
  immediate,
  delay = 0,
}: Props) => {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <>
      <Build
        label={label}
        immediate={immediate}
        delay={delay}
        className="w-fit"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
          {eyebrow}
        </p>
        <Title className={cn("mt-5 font-display", SIZE[level])}>
          <WaveText text={title} />
        </Title>
      </Build>
      {intro && (
        <Build
          label="Text · intro"
          immediate={immediate}
          delay={delay + 0.1}
          className="mt-8 max-w-xl"
        >
          <p className="text-lg leading-relaxed text-fog">{intro}</p>
        </Build>
      )}
    </>
  );
};

export default Heading;
