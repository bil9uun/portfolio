import { useEffect, useState } from "react";
import { readSetting, writeSetting } from "@/lib/store";
import { swarm } from "@/lib/swarm";

/**
 * A personal best kept in this browser. `higher` scores win for points,
 * `lower` for times. Returns the best and a function to submit a result;
 * it returns true when the result is a new best.
 */
export function useBest(id: string, better: "higher" | "lower") {
  const key = `${id}-best`;
  const [best, setBest] = useState<number | null>(() => readBest(id));

  const submit = (value: number) => {
    const current = readBest(id);
    const wins =
      current === null ||
      (better === "higher" ? value > current : value < current);
    if (wins) {
      writeSetting(key, String(value));
      setBest(value);
    }
    return wins;
  };

  return [best, submit] as const;
}

export function readBest(id: string) {
  const raw = readSetting(`${id}-best`);
  const value = raw === null ? NaN : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Keep the site's swarm cursors out of the way while a game is on screen. */
export function useHideSwarm(hidden = true) {
  useEffect(() => {
    swarm.hidden = hidden;
    return () => {
      swarm.hidden = false;
    };
  }, [hidden]);
}

/** Seconds as m:ss.s */
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};
