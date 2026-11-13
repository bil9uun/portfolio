import { createContext, useContext } from "react";

// Smoothed animation values the 3D models read every frame, without
// re-rendering: how far the desk is exploded and how see-through the PC is.
export type DeskAnim = {
  explode: number;
  explodeTarget: number;
  xray: number;
  xrayTarget: number;
};

export const AnimContext = createContext<{ current: DeskAnim }>({
  current: { explode: 0, explodeTarget: 0, xray: 0, xrayTarget: 0 },
});

export const useDeskAnim = () => useContext(AnimContext);
