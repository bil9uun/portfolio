import { useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, Phone } from "lucide-react";
import SectionHeading from "@/components/section-heading";
import { profile } from "@/data/portfolio";
import { useLocalTime } from "@/hooks/use-local-time";
import Build from "@/components/build";
import { scrollToSection } from "@/lib/gsap";

const ContactSection = () => {
  const time = useLocalTime(profile.timeZone);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="pt-32 md:pt-48">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          index="06"
          label="contact"
          title="Have a project in mind?"
        />

        <Build label="Text · intro" className="mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-fog">
            I'm open to frontend roles and freelance work. Write to me and I'll
            reply within a day.
          </p>
        </Build>

        <Build
          label="Link · email"
          delay={0.1}
          className="mt-14 w-fit md:mt-20"
        >
          <div className="flex flex-col items-start gap-6">
            <a
              href={`mailto:${profile.email}`}
              data-swarm
              className="group relative font-display text-[clamp(2rem,7vw,6rem)] font-semibold leading-none tracking-[-0.02em]"
            >
              {/* Wrap before "@" on narrow screens, never mid-word. */}
              {profile.email.split("@")[0]}
              <wbr />@{profile.email.split("@")[1]}
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 h-[3px] w-full origin-left scale-x-0 bg-signal transition-transform duration-700 ease-out group-hover:scale-x-100"
              />
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-fog transition-colors hover:border-signal hover:text-bone"
            >
              {copied ? (
                <Check aria-hidden className="size-3.5 text-signal" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              <span aria-live="polite">
                {copied ? "Email copied" : "Copy email"}
              </span>
            </button>
          </div>
        </Build>

        <Build label="Link · phone" delay={0.15} className="mt-12 w-fit">
          <a
            href={profile.phone.href}
            data-swarm
            className="group inline-flex items-center gap-4 font-display text-[clamp(1.5rem,4vw,3rem)] font-semibold leading-none tracking-[-0.01em] transition-colors hover:text-signal"
          >
            <Phone
              aria-hidden
              strokeWidth={1.5}
              className="size-[0.8em] text-signal transition-transform duration-500 group-hover:-rotate-12"
            />
            {profile.phone.label}
          </a>
        </Build>

        <Build label="List · socials" className="mt-20 w-fit">
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  data-swarm
                  className="group inline-flex items-center gap-1.5 text-lg transition-colors hover:text-signal"
                >
                  {social.label}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Build>

        <footer className="mt-32 flex flex-col gap-4 border-t border-line py-8 font-mono text-xs text-fog md:flex-row md:items-center md:justify-between">
          <Build label="Text · copyright" start="top bottom" className="w-fit">
            <p>
              © {new Date().getFullYear()} {profile.name}. Designed and built
              by me.
            </p>
          </Build>
          <Build
            label="Text · local time"
            start="top bottom"
            delay={0.1}
            className="w-fit"
          >
            <p>
              {profile.location} · <span className="text-bone">{time}</span>
            </p>
          </Build>
          <Build
            label="Link · back to top"
            start="top bottom"
            delay={0.2}
            className="w-fit"
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-bone"
            >
              Back to top <ArrowUp aria-hidden className="size-3.5" />
            </a>
          </Build>
        </footer>
      </div>
    </section>
  );
};

export default ContactSection;
