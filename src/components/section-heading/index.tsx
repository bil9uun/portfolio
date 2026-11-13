import Build from "@/components/build";
import WaveText from "@/components/wave-text";
import { navItems, sectionTitles } from "@/data/portfolio";
import { useT } from "@/lib/i18n";

type Props = { id: keyof typeof sectionTitles };

// Eyebrow ("02 // expertise") and title, numbered by the section's place in the nav.
const SectionHeading = ({ id }: Props) => {
  const tr = useT();
  const position = navItems.findIndex((item) => item.id === id);
  const index = String(position + 1).padStart(2, "0");

  return (
    <Build
      label={`Heading · ${id}`}
      className="w-fit"
      frameClassName="-inset-x-3 -inset-y-2"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
        <span className="text-signal">{index}</span> //{" "}
        {tr(navItems[position].label)}
      </p>
      <h2 className="mt-5 font-display text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.015em]">
        <WaveText text={tr(sectionTitles[id])} />
      </h2>
    </Build>
  );
};

export default SectionHeading;
