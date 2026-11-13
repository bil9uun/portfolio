import Heading from "@/components/ui/heading";
import { navItems, sectionTitles } from "@/content/portfolio";
import { useT } from "@/lib/i18n";

type Props = { id: keyof typeof sectionTitles; intro?: string };

// A home-page section's heading, numbered by its place in the nav:
// "02 // expertise".
const SectionHeading = ({ id, intro }: Props) => {
  const tr = useT();
  const position = navItems.findIndex((item) => item.id === id);
  return (
    <Heading
      label={`Heading · ${id}`}
      eyebrow={
        <>
          <span className="text-signal">
            {String(position + 1).padStart(2, "0")}
          </span>{" "}
          // {tr(navItems[position].label)}
        </>
      }
      title={tr(sectionTitles[id])}
      intro={intro}
    />
  );
};

export default SectionHeading;
