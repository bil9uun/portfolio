import SectionHeading from "@/components/section-heading";
import { expertise } from "@/data/portfolio";
import Build from "@/components/build";
import { useT } from "@/lib/i18n";

const ExpertiseSection = () => {
  const tr = useT();
  return (
    <section id="expertise" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="expertise" />

        <div className="mt-16 grid gap-px border border-line bg-line md:mt-24 md:grid-cols-3">
          {expertise.map(({ icon: Icon, title, body }, i) => (
            <Build
              key={title.en}
              label={`Card · ${title.en}`}
              delay={i * 0.12}
              data-swarm
              frameClassName="inset-3"
              className="group bg-ink p-8 transition-colors duration-500 hover:bg-graphite md:p-10"
            >
              <Icon
                aria-hidden
                strokeWidth={1.5}
                className="size-11 text-signal transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110"
              />
              <h3 className="mt-10 font-display text-2xl font-semibold leading-tight tracking-tight md:min-h-[2.5em] md:text-[1.75rem]">
                {tr(title)}
              </h3>
              <p className="heading mb-8 mt-14 pl-5 text-fog">{tr(body)}</p>
            </Build>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
