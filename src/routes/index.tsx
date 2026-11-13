import AfkSection from "@/components/afk";
import ArcadeSection from "@/components/arcade";
import ContactSection from "@/components/contact";
import ExpertiseSection from "@/components/expertise";
import HeroSection from "@/components/hero";
import SetupSection from "@/components/setup";
import CareerSection from "@/components/career";
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
      <CareerSection />
      <ArcadeSection />
      <AfkSection />
      <SetupSection />
      <ContactSection />
    </div>
  );
}
