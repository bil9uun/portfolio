import SectionHeading from "@/components/section-heading";
import SkillPile from "@/components/skill-pile";
import { expertise } from "@/data/portfolio";
import Build from "@/components/build";
import { useT } from "@/lib/i18n";

// What I do, in three short notes, next to a pile of the tools I do it with.
const ExpertiseSection = () => {
  const tr = useT();
  return (
    <section id="expertise" className="py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="expertise" />

        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-12">
          <ul className="border-b border-line lg:col-span-5">
            {expertise.map(({ icon: Icon, title, body }, i) => (
              <li key={title.en}>
                <Build
                  label={`Item · ${title.en}`}
                  delay={i * 0.1}
                  data-swarm
                  frameClassName="inset-x-0 inset-y-1"
                  className="group"
                >
                  <div className="grid grid-cols-[auto_1fr] gap-x-5 border-t border-line py-8">
                    <Icon
                      aria-hidden
                      strokeWidth={1.5}
                      className="mt-1 size-7 text-signal transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110"
                    />
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight">
                        {tr(title)}
                      </h3>
                      <p className="mt-3 leading-relaxed text-fog">
                        {tr(body)}
                      </p>
                    </div>
                  </div>
                </Build>
              </li>
            ))}
          </ul>

          <Build
            label="Frame · stack"
            delay={0.2}
            frameClassName="-inset-2"
            className="lg:col-span-7"
          >
            <SkillPile />
          </Build>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
