import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import Desk3D from "@/components/desk-3d";
import Build from "@/components/ui/build";
import Heading from "@/components/ui/heading";
import { container, pillButton } from "@/components/ui/styles";
import { useGroups } from "@/content/uses";
import { t, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// My two desks in 3D, then the software I use most. The full list lives
// on /uses.

const copy = {
  eyebrow: t("Setup", "Setup"),
  title: t("My desks", "Миний ширээ"),
  intro: t(
    "One desk for code, one for Counter-Strike, modelled at real size. Explode them, x-ray the PC or take the tour.",
    "Нэг ширээ код бичихэд, нөгөө нь Counter-Strike-д, бодит хэмжээгээр загварчилсан. Задалж, компьютерийн дотрыг харж, эсвэл аяллыг эхлүүлээрэй.",
  ),
  software: t("Software", "Программ хангамж"),
  all: t("See the full setup", "Бүгдийг харах"),
};

const software = useGroups
  .find((g) => g.id === "software")!
  .items.filter((s) => s.kind.en !== "Extensions")
  .slice(0, 8);

const SetupSection = () => {
  const tr = useT();

  return (
    <section id="setup" className="py-32 md:py-48">
      <div className={container}>
        <Heading
          label="Heading · setup"
          eyebrow={
            <>
              <span className="text-signal">//</span> {tr(copy.eyebrow)}
            </>
          }
          title={tr(copy.title)}
          intro={tr(copy.intro)}
        />

        <Build label="Frame · desks" className="mt-16 md:mt-24">
          <Desk3D />
        </Build>

        {/* Software, briefly */}
        <Build label="List · software" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                {tr(copy.software)}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-4">
                {software.map((s) => (
                  <li key={s.name}>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-fog">
                      {tr(s.kind)}
                    </span>
                    <span className="text-sm text-bone">
                      {s.name.split(" · ")[0]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/uses" data-swarm className={cn("group", pillButton)}>
              {tr(copy.all)}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Build>
      </div>
    </section>
  );
};

export default SetupSection;
