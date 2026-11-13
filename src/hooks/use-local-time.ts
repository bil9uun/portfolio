import { useEffect, useState } from "react";

export function useLocalTime(timeZone: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(now);
}

export type LocalStatus = "working" | "free" | "asleep";

// A guess at what I'm doing right now, from the time in my time zone.
export function localStatus(timeZone: string, now = new Date()): LocalStatus {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hourCycle: "h23",
    weekday: "short",
    timeZone,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  if (hour >= 23 || hour < 7) return "asleep";
  if (!/Sat|Sun/.test(weekday) && hour >= 9 && hour < 18) return "working";
  return "free";
}
