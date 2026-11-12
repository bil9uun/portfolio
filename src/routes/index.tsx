import ContactSection from "@/components/contact";
import ExpertiseSection from "@/components/expertise";
import HeroSection from "@/components/hero";
import TimelineSection from "@/components/timeline";
import EducationSection from "@/components/education";
import { experience } from "@/data/portfolio";
import WorkSection from "@/components/work";
import { createFileRoute } from "@tanstack/react-router";
import { usePageReady } from "@/lib/navigation";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  usePageReady();
  return (
    <div className="w-full flex flex-col ">
      <HeroSection />
      <ExpertiseSection />
      <WorkSection />
      <TimelineSection id="experience" items={experience} />
      <EducationSection />
      <ContactSection />
    </div>
  );
}
