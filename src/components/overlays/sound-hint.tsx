import { Volume2 } from "lucide-react";
import { t, useT } from "@/lib/i18n";
import { blip, soundLocked, soundOn } from "@/lib/sound";
import { useStore } from "@/lib/store";

const copy = t(
  "Sound is on · click anywhere to hear it",
  "Дуу асаалттай · сонсохын тулд хаана ч хамаагүй дарна уу",
);

// Sound was left on last visit, but the browser keeps audio muted until the
// visitor clicks or presses a key. Say so, until they do.
const SoundHint = () => {
  const tr = useT();
  const on = useStore(soundOn);
  const locked = useStore(soundLocked);
  if (!on || !locked) return null;

  return (
    <button
      type="button"
      onClick={() => blip({ pitch: 1.5 })}
      className="fixed bottom-6 left-1/2 z-[55] inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-signal/60 bg-ink/90 px-4 py-2 font-mono text-[11px] text-bone shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur"
    >
      <Volume2 aria-hidden className="size-3.5 animate-pulse text-signal" />
      {tr(copy)}
    </button>
  );
};

export default SoundHint;
