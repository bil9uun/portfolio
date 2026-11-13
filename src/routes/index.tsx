import AfkSection from "@/sections/afk";
import ArcadeSection from "@/sections/arcade";
import ContactSection from "@/sections/contact";
import ExpertiseSection from "@/sections/expertise";
import HeroSection from "@/sections/hero";
import SetupSection from "@/sections/setup";
import CareerSection from "@/sections/career";
import WorkSection from "@/sections/work";
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
