import { Link } from "@tanstack/react-router";
import { ArrowUp, Gamepad2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Build from "@/components/build";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import { scrollToTop } from "@/lib/gsap";
import { ui, useT } from "@/lib/i18n";
import { replayBuild } from "@/lib/replay";
import { setSound, soundOn } from "@/lib/sound";
import { useStore } from "@/lib/store";

const control =
  "inline-flex items-center gap-1.5 transition-colors hover:text-bone";

const Footer = () => {
  const tr = useT();
  const time = useLocalTime(profile.timeZone);
  const sound = useStore(soundOn);

  return (
    <footer className="mt-32 border-t border-line py-8 font-mono text-xs text-fog">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Build label="Text · shortcuts" start="top bottom" className="w-fit">
          <p className="pointer-coarse:hidden">{tr(ui.shortcuts)}</p>
        </Build>
        <Build
          label="Controls"
          start="top bottom"
          delay={0.1}
          className="w-fit"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => setSound(!sound)}
              aria-pressed={sound}
              className={control}
            >
              {sound ? (
                <Volume2 aria-hidden className="size-3.5 text-signal" />
              ) : (
                <VolumeX aria-hidden className="size-3.5" />
              )}
              {tr(sound ? ui.soundOn : ui.soundOff)}
            </button>
            <button type="button" onClick={replayBuild} className={control}>
              <RotateCcw aria-hidden className="size-3.5" />
              {tr(ui.replay)}
            </button>
            <Link to="/play" className={control}>
              <Gamepad2 aria-hidden className="size-3.5" />
              {tr(ui.play)}
            </Link>
          </div>
        </Build>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Build
          label="Text · copyright"
          start="top bottom"
          delay={0.15}
          className="w-fit"
        >
          <p>
            © {new Date().getFullYear()} {profile.name}.
          </p>
        </Build>
        <Build
          label="Text · local time"
          start="top bottom"
          delay={0.2}
          className="w-fit"
        >
          <p>
            {tr(profile.location)} · <span className="text-bone">{time}</span>
          </p>
        </Build>
        <Build
          label="Link · back to top"
          start="top bottom"
          delay={0.25}
          className="w-fit"
        >
          <button
            type="button"
            onClick={() => scrollToTop()}
            className={control}
          >
            {tr(ui.backToTop)} <ArrowUp aria-hidden className="size-3.5" />
          </button>
        </Build>
      </div>
    </footer>
  );
};

export default Footer;
