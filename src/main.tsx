import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { scrollToTop } from "@/lib/gsap";
import "./style.css";

const router = createRouter({ routeTree });

// A new page starts at the top. Jump (not animate) so scroll-triggered
// builds on the new page are measured from the top.
router.subscribe("onBeforeRouteMount", ({ pathChanged }) => {
  if (pathChanged) scrollToTop(false);
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
