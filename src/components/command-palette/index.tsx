import type { ReactNode } from "react";
import { Command } from "cmdk";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Copy,
  Languages,
  MessageCircle,
  Phone,
  RotateCcw,
  ScanSearch,
  Volume2,
} from "lucide-react";
import { navItems, profile, projects } from "@/data/portfolio";
import { setLang, ui, useLang, useT } from "@/lib/i18n";
import { useGoToSection } from "@/lib/navigation";
import { replayBuild } from "@/lib/replay";
import { setSound, soundOn } from "@/lib/sound";
import { chatOpen, inspectMode, paletteOpen, useStore } from "@/lib/store";

const Item = ({
  icon,
  children,
  onSelect,
  keywords,
}: {
  icon: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  keywords?: string[];
}) => (
  <Command.Item
    onSelect={onSelect}
    keywords={keywords}
    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-bone/85 data-[selected=true]:bg-graphite data-[selected=true]:text-bone [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fog data-[selected=true]:[&_svg]:text-signal"
  >
    {icon}
    {children}
  </Command.Item>
);

const group =
  "px-1 py-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-fog";

// Jump anywhere, run any action. Opened with ⌘K / Ctrl+K (see __root.tsx).
const CommandPalette = () => {
  const tr = useT();
  const lang = useLang();
  const open = useStore(paletteOpen);
  const navigate = useNavigate();
  const goToSection = useGoToSection();

  // Close first, then act, so the dialog never covers the result.
  const run = (action: () => void) => () => {
    paletteOpen.set(false);
    requestAnimationFrame(action);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={paletteOpen.set}
      label={tr(ui.searchCommands)}
      loop
      overlayClassName="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[14vh] z-[71] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-ink shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
    >
      <DialogTitle className="sr-only">{tr(ui.searchCommands)}</DialogTitle>
      <DialogDescription className="sr-only">
        {tr(ui.goTo)}, {tr(ui.projects)}, {tr(ui.actions)}
      </DialogDescription>
      <Command.Input
        autoFocus
        placeholder={tr(ui.searchCommands)}
        className="w-full border-b border-line bg-transparent px-5 py-4 text-base text-bone outline-none placeholder:text-fog"
      />
      <Command.List className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain p-1">
        <Command.Empty className="px-4 py-8 text-center text-sm text-fog">
          {tr(ui.noResults)}
        </Command.Empty>

        <Command.Group heading={tr(ui.goTo)} className={group}>
          {navItems.map(({ id, label }, i) => (
            <Item
              key={id}
              icon={
                <span className="w-4 font-mono text-[10px] text-fog">
                  {String(i + 1).padStart(2, "0")}
                </span>
              }
              keywords={[id, label.en, label.mn]}
              onSelect={run(() => goToSection(id))}
            >
              {tr(label)}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading={tr(ui.projects)} className={group}>
          {projects.map((project) => (
            <Item
              key={project.slug}
              icon={<ArrowRight />}
              keywords={project.tags}
              onSelect={run(
                () =>
                  void navigate({
                    to: "/work/$slug",
                    params: { slug: project.slug },
                  }),
              )}
            >
              {project.title}
              <span className="ml-auto font-mono text-[11px] text-fog">
                {project.year}
              </span>
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading={tr(ui.actions)} className={group}>
          <Item
            icon={<Copy />}
            keywords={["email", "mail"]}
            onSelect={run(
              () => void navigator.clipboard?.writeText(profile.email),
            )}
          >
            {tr(ui.copyEmail)}
            <span className="ml-auto truncate font-mono text-[11px] text-fog">
              {profile.email}
            </span>
          </Item>
          <Item
            icon={<Languages />}
            keywords={["language", "хэл", "mongolian", "english"]}
            onSelect={run(() => setLang(lang === "en" ? "mn" : "en"))}
          >
            {tr(ui.switchLang)}
          </Item>
          <Item
            icon={<RotateCcw />}
            keywords={["replay", "rebuild"]}
            onSelect={run(replayBuild)}
          >
            {tr(ui.replay)}
          </Item>
          <Item
            icon={<ScanSearch />}
            keywords={["inspect", "css", "design"]}
            onSelect={run(() => inspectMode.set(!inspectMode.get()))}
          >
            {tr(ui.inspect)}
            <kbd className="ml-auto font-mono text-[11px] text-fog">I</kbd>
          </Item>
          <Item
            icon={<MessageCircle />}
            keywords={["chat", "message"]}
            onSelect={run(() => chatOpen.set(true))}
          >
            {tr(ui.chat)}
            <kbd className="ml-auto font-mono text-[11px] text-fog">/</kbd>
          </Item>
          <Item
            icon={<Volume2 />}
            keywords={["sound", "audio", "дуу"]}
            onSelect={run(() => setSound(!soundOn.get()))}
          >
            {tr(ui.toggleSound)}
          </Item>
        </Command.Group>

        <Command.Group heading={tr(ui.links)} className={group}>
          <Item
            icon={<Phone />}
            onSelect={run(() => window.open(profile.phone.href, "_self"))}
          >
            {tr(ui.call)} {profile.phone.label}
          </Item>
          {profile.socials.map((social) => (
            <Item
              key={social.label}
              icon={<ArrowUpRight />}
              onSelect={run(() =>
                window.open(social.href, "_blank", "noopener"),
              )}
            >
              {social.label}
            </Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandPalette;
