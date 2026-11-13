import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AchievementToast from "@/components/achievement-toast";
import Backdrop from "@/components/backdrop";
import CursorChat from "@/components/cursor-chat";
import Header from "@/components/header";
import InspectOverlay from "@/components/inspect";
import SoundHint from "@/components/sound-hint";
import SwarmCursors from "@/components/swarm-cursors";
import {
  gsap,
  prefersReducedMotion,
  ScrollSmoother,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";
import "@/lib/party"; // listens for the Konami code
import { REBUILT } from "@/lib/replay";
import {
  isTyping,
  paletteOpen,
  replayCount,
  terminalOpen,
  useStore,
} from "@/lib/store";

// The palette (cmdk + dialog) and the terminal load the first time they open.
const CommandPalette = lazy(() => import("@/components/command-palette"));
const Terminal = lazy(() => import("@/components/terminal"));

const RootLayout = () => {
  const replay = useStore(replayCount);
  const paletteRequested = useStore(paletteOpen);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  if (paletteRequested && !paletteLoaded) setPaletteLoaded(true);
  const terminalRequested = useStore(terminalOpen);
  const [terminalLoaded, setTerminalLoaded] = useState(false);
  if (terminalRequested && !terminalLoaded) setTerminalLoaded(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        paletteOpen.set(!paletteOpen.get());
      } else if (
        e.key === "`" &&
        !terminalOpen.get() &&
        !paletteOpen.get() &&
        !isTyping(e.target)
      ) {
        e.preventDefault();
        terminalOpen.set(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useGSAP(() => {
    ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: prefersReducedMotion() ? 0 : 1.2,
      effects: true,
    });
  });

  // After a replay remounts the page, show it again. Children have already
  // hidden their content in their own layout effects, so nothing flashes.
  useLayoutEffect(() => {
    if (replay === 0) return;
    gsap.set(REBUILT, { autoAlpha: 1 });
    ScrollTrigger.refresh();
  }, [replay]);

  return (
    <>
      {/* Fixed layers live outside the smoothed content, which is transformed. */}
      <Backdrop />
      <Header key={`header-${replay}`} />
      <SwarmCursors />
      <CursorChat />
      <InspectOverlay />
      <SoundHint />
      <AchievementToast />
      {terminalLoaded && (
        <Suspense fallback={null}>
          <Terminal />
        </Suspense>
      )}
      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
      )}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main key={`main-${replay}`} className="overflow-x-clip">
            <Outlet />
          </main>
        </div>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
