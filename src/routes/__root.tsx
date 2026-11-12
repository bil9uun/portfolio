import Header from "@/components/header";
import SwarmCursors from "@/components/swarm-cursors";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { prefersReducedMotion, ScrollSmoother, useGSAP } from "@/lib/gsap";

const RootLayout = () => {
  useGSAP(() => {
    ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: prefersReducedMotion() ? 0 : 1.2,
      effects: true,
    });
  });

  return (
    <>
      {/* Fixed layers live outside the smoothed content, which is transformed. */}
      <Header />
      <SwarmCursors />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="overflow-x-clip">
            <Outlet />
          </main>
        </div>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
