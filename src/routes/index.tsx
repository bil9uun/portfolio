import ContactSection from "@/components/contact";
import ExpertiseSection from "@/components/expertise";
import HeroSection from "@/components/hero";
import TimelineSection from "@/components/timeline";
import EducationSection from "@/components/education";
import { experience } from "@/data/portfolio";
import WorkSection from "@/components/work";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="w-full flex flex-col ">
      <HeroSection />
      <ExpertiseSection />
      <WorkSection />
      <TimelineSection
        id="experience"
        index="04"
        title="Experience"
        items={experience}
      />
      <EducationSection />
      <ContactSection />
    </div>
  );
}
